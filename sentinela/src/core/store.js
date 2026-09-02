// Camada de persistência.
//
// A implementação atual grava em localStorage, mas todo o restante do sistema
// conversa apenas com a interface `db` (listar/obter/inserir/atualizar/remover).
// Substituir por uma API HTTP exige reescrever somente este arquivo.

import { uid, hoje } from './util.js';

const CHAVE = 'sentinela.dados.v1';
const CHAVE_SESSAO = 'sentinela.sessao.v1';

export const COLECOES = [
  'usuarios', 'clientes', 'processos', 'prazos', 'tarefas', 'audiencias',
  'publicacoes', 'documentos', 'comunicacoes', 'financeiro', 'movimentacoes',
  'auditoria', 'notificacoes', 'feriados', 'suspensoes',
];

const estadoInicial = () => ({
  versao: 1,
  configuracoes: configuracoesPadrao(),
  ...Object.fromEntries(COLECOES.map((c) => [c, []])),
});

export function configuracoesPadrao() {
  return {
    escritorio: { nome: 'Escritório de Advocacia', oab: '', email: '', telefone: '', whatsapp: '' },
    alertasPadrao: [7, 5, 3, 1, 0],
    recessoForense: true,
    cores: {
      fatal: '#e5484d',
      urgente: '#e5484d',
      proximo: '#f76b15',
      tarefa: '#f5d90a',
      audiencia: '#3b82f6',
      concluido: '#30a46c',
      cancelado: '#6b7280',
      publicacao: '#8b5cf6',
    },
    automacoesWhatsapp: {
      prazoProximo: { ativo: true, antecedencia: 3 },
      audiencia: { ativo: true, antecedencia: 2 },
      relatorioMensal: { ativo: false, dia: 1 },
    },
    integracoes: {
      publicacoes: { ativo: false, provedor: '', chave: '', dias: ['seg', 'qua', 'sex'], ultimaConsulta: null },
      ia: { ativo: false, provedor: 'heuristico', endpoint: '', chave: '', modelo: '' },
      whatsapp: { ativo: false, provedor: '', numero: '', token: '' },
      email: { ativo: false, remetente: '', servidor: '' },
      calendario: { ativo: false, provedor: '' },
    },
  };
}

let estado = null;
const ouvintes = new Set();

function carregar() {
  if (estado) return estado;
  try {
    const bruto = localStorage.getItem(CHAVE);
    estado = bruto ? { ...estadoInicial(), ...JSON.parse(bruto) } : estadoInicial();
    estado.configuracoes = { ...configuracoesPadrao(), ...(estado.configuracoes || {}) };
  } catch (e) {
    console.error('Falha ao ler os dados locais. Iniciando base vazia.', e);
    estado = estadoInicial();
  }
  return estado;
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (e) {
    console.error('Não foi possível gravar os dados.', e);
    throw new Error('Armazenamento local cheio ou indisponível.');
  }
  ouvintes.forEach((fn) => fn(estado));
}

export const aoMudar = (fn) => { ouvintes.add(fn); return () => ouvintes.delete(fn); };

/* --------------------------------------------------------------- sessão -- */

export const sessao = {
  obter() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || localStorage.getItem(CHAVE_SESSAO) || 'null'); }
    catch { return null; }
  },
  definir(valor, lembrar = true) {
    const s = JSON.stringify(valor);
    sessionStorage.setItem(CHAVE_SESSAO, s);
    if (lembrar) localStorage.setItem(CHAVE_SESSAO, s);
  },
  limpar() {
    sessionStorage.removeItem(CHAVE_SESSAO);
    localStorage.removeItem(CHAVE_SESSAO);
  },
};

/* ------------------------------------------------------------ auditoria -- */

function registrarAuditoria(colecao, id, acao, detalhe, antes, depois) {
  if (colecao === 'auditoria' || colecao === 'notificacoes') return;
  estado.auditoria.unshift({
    id: uid('aud'),
    quando: new Date().toISOString(),
    usuarioId: sessao.obter()?.usuarioId || null,
    usuarioNome: sessao.obter()?.nome || 'Sistema',
    colecao, registroId: id, acao, detalhe,
    antes: antes ? resumir(antes) : null,
    depois: depois ? resumir(depois) : null,
  });
  if (estado.auditoria.length > 5000) estado.auditoria.length = 5000;
}

const resumir = (obj) => {
  const copia = { ...obj };
  delete copia.conteudoArquivo;
  return copia;
};

/* --------------------------------------------------------------- acesso -- */

export const db = {
  estado: () => carregar(),

  /** Lista registros ativos. `{ incluirExcluidos: true }` traz a lixeira. */
  listar(colecao, filtro = {}) {
    const dados = carregar()[colecao] || [];
    const lista = filtro.incluirExcluidos ? dados : dados.filter((r) => !r.excluidoEm);
    const criterios = Object.entries(filtro).filter(([k]) => k !== 'incluirExcluidos');
    if (!criterios.length) return lista;
    return lista.filter((r) => criterios.every(([k, v]) => (Array.isArray(v) ? v.includes(r[k]) : r[k] === v)));
  },

  obter(colecao, id) {
    return (carregar()[colecao] || []).find((r) => r.id === id) || null;
  },

  inserir(colecao, dados, detalhe) {
    carregar();
    const registro = {
      ...dados,
      id: dados.id || uid(colecao.slice(0, 3)),
      criadoEm: new Date().toISOString(),
      criadoPor: sessao.obter()?.usuarioId || null,
      atualizadoEm: new Date().toISOString(),
    };
    estado[colecao].push(registro);
    registrarAuditoria(colecao, registro.id, 'criou', detalhe, null, registro);
    salvar();
    return registro;
  },

  atualizar(colecao, id, mudancas, detalhe) {
    carregar();
    const i = estado[colecao].findIndex((r) => r.id === id);
    if (i < 0) throw new Error('Registro não encontrado.');
    const antes = { ...estado[colecao][i] };
    const depois = {
      ...antes, ...mudancas, id,
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: sessao.obter()?.usuarioId || null,
    };
    estado[colecao][i] = depois;
    registrarAuditoria(colecao, id, 'alterou', detalhe || descreverMudancas(antes, mudancas), antes, depois);
    salvar();
    return depois;
  },

  /** Exclusão lógica: o registro permanece recuperável na lixeira. */
  remover(colecao, id, motivo) {
    carregar();
    const i = estado[colecao].findIndex((r) => r.id === id);
    if (i < 0) return null;
    const antes = { ...estado[colecao][i] };
    estado[colecao][i] = {
      ...antes,
      excluidoEm: new Date().toISOString(),
      excluidoPor: sessao.obter()?.usuarioId || null,
      motivoExclusao: motivo || null,
    };
    registrarAuditoria(colecao, id, 'excluiu', motivo, antes, null);
    salvar();
    return estado[colecao][i];
  },

  restaurar(colecao, id) {
    carregar();
    const i = estado[colecao].findIndex((r) => r.id === id);
    if (i < 0) return null;
    const { excluidoEm, excluidoPor, motivoExclusao, ...limpo } = estado[colecao][i];
    estado[colecao][i] = limpo;
    registrarAuditoria(colecao, id, 'restaurou', 'Registro recuperado da lixeira', null, limpo);
    salvar();
    return limpo;
  },

  /** Remoção física — exigida apenas em rotinas administrativas explícitas. */
  removerDefinitivo(colecao, id) {
    carregar();
    const antes = estado[colecao].find((r) => r.id === id);
    estado[colecao] = estado[colecao].filter((r) => r.id !== id);
    registrarAuditoria(colecao, id, 'excluiu definitivamente', 'Exclusão irreversível', antes, null);
    salvar();
  },

  config() { return carregar().configuracoes; },

  salvarConfig(mudancas) {
    carregar();
    estado.configuracoes = { ...estado.configuracoes, ...mudancas };
    registrarAuditoria('configuracoes', 'geral', 'alterou', 'Configurações do sistema', null, null);
    salvar();
    return estado.configuracoes;
  },

  /* ------------------------------------------------------------ backup -- */

  exportar() {
    return JSON.stringify({ ...carregar(), exportadoEm: new Date().toISOString() }, null, 2);
  },

  importar(json, { substituir = false } = {}) {
    const dados = typeof json === 'string' ? JSON.parse(json) : json;
    carregar();
    if (substituir) {
      estado = { ...estadoInicial(), ...dados };
    } else {
      for (const c of COLECOES) {
        const existentes = new Set(estado[c].map((r) => r.id));
        for (const r of (dados[c] || [])) if (!existentes.has(r.id)) estado[c].push(r);
      }
      estado.configuracoes = { ...estado.configuracoes, ...(dados.configuracoes || {}) };
    }
    registrarAuditoria('sistema', 'backup', 'importou', substituir ? 'Restauração completa' : 'Mesclagem de backup');
    salvar();
  },

  zerar() {
    estado = estadoInicial();
    salvar();
  },

  /** Cópia de segurança automática mantida em chave separada. */
  backupAutomatico() {
    try {
      const marca = `sentinela.backup.${hoje()}`;
      if (!localStorage.getItem(marca)) {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith('sentinela.backup.') && k !== marca) localStorage.removeItem(k);
        }
        localStorage.setItem(marca, localStorage.getItem(CHAVE) || '');
      }
    } catch (e) { console.warn('Backup automático não realizado.', e); }
  },
};

function descreverMudancas(antes, mudancas) {
  const campos = Object.keys(mudancas).filter((k) => JSON.stringify(antes[k]) !== JSON.stringify(mudancas[k]));
  return campos.length ? `Campos alterados: ${campos.join(', ')}` : 'Sem alterações efetivas';
}
