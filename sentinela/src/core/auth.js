// Autenticação e controle de acesso.
//
// A senha nunca é gravada em texto puro: guarda-se o hash SHA-256 com sal por
// usuário. Em produção este módulo deve delegar a um backend com política de
// senha, expiração de sessão e segundo fator.

import { db, sessao } from './store.js';
import { norm, uid } from './util.js';

export const PERFIS = {
  admin: {
    rotulo: 'Administrador',
    descricao: 'Acesso integral, incluindo usuários, permissões e configurações.',
    permissoes: ['*'],
  },
  advogado: {
    rotulo: 'Advogado',
    descricao: 'Processos, prazos, clientes, audiências, publicações e relatórios.',
    permissoes: [
      'dashboard:ver', 'agenda:ver', 'prazos:*', 'processos:*', 'clientes:*', 'tarefas:*',
      'audiencias:*', 'publicacoes:*', 'documentos:*', 'relatorios:ver', 'comunicacoes:*',
      'ia:usar', 'configuracoes:ver',
    ],
  },
  assistente: {
    rotulo: 'Assistente',
    descricao: 'Tarefas, documentos, agenda e apoio ao cadastro, sem exclusões.',
    permissoes: [
      'dashboard:ver', 'agenda:ver', 'prazos:ver', 'prazos:criar', 'prazos:editar',
      'processos:ver', 'clientes:ver', 'tarefas:*', 'audiencias:ver', 'audiencias:criar',
      'publicacoes:ver', 'documentos:*', 'comunicacoes:ver', 'ia:usar',
    ],
  },
  financeiro: {
    rotulo: 'Financeiro',
    descricao: 'Módulo financeiro, clientes e relatórios econômicos.',
    permissoes: ['dashboard:ver', 'financeiro:*', 'clientes:ver', 'relatorios:ver'],
  },
};

export async function hashSenha(senha, sal) {
  const dados = new TextEncoder().encode(`${sal}::${senha}`);
  const buffer = await crypto.subtle.digest('SHA-256', dados);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function criarUsuario({ nome, email, senha, perfil = 'advogado', oab = '', permissoes = null }) {
  if (db.listar('usuarios').some((u) => norm(u.email) === norm(email))) {
    throw new Error('Já existe usuário com este e-mail.');
  }
  const sal = uid('sal');
  return db.inserir('usuarios', {
    nome, email: String(email).toLowerCase(), perfil, oab, sal,
    senhaHash: await hashSenha(senha, sal),
    permissoes, ativo: true,
  }, `Usuário ${nome} criado`);
}

export async function definirSenha(usuarioId, senha) {
  const sal = uid('sal');
  return db.atualizar('usuarios', usuarioId,
    { sal, senhaHash: await hashSenha(senha, sal) }, 'Senha alterada');
}

export async function autenticar(email, senha) {
  const u = db.listar('usuarios').find((x) => norm(x.email) === norm(email));
  if (!u || u.ativo === false) throw new Error('Usuário não encontrado ou inativo.');
  const hash = await hashSenha(senha, u.sal);
  if (hash !== u.senhaHash) throw new Error('Credenciais inválidas.');
  sessao.definir({ usuarioId: u.id, nome: u.nome, perfil: u.perfil, em: new Date().toISOString() });
  db.atualizar('usuarios', u.id, { ultimoAcesso: new Date().toISOString() }, 'Acesso ao sistema');
  return u;
}

export const usuarioAtual = () => {
  const s = sessao.obter();
  return s ? db.obter('usuarios', s.usuarioId) : null;
};

export const sair = () => sessao.limpar();

/** Verifica permissão no formato "modulo:acao". */
export function pode(acao, usuario = usuarioAtual()) {
  if (!usuario) return false;
  const lista = usuario.permissoes?.length ? usuario.permissoes : PERFIS[usuario.perfil]?.permissoes || [];
  if (lista.includes('*')) return true;
  const [modulo] = acao.split(':');
  return lista.includes(acao) || lista.includes(`${modulo}:*`);
}

export const exigir = (acao) => {
  if (!pode(acao)) throw new Error('Você não possui permissão para esta operação.');
};
