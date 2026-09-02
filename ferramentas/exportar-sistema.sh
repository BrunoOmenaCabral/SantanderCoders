#!/usr/bin/env bash
# Extrai o Sentinela deste repositório de estudos para uma pasta própria,
# pronta para virar um repositório novo, com histórico limpo.
#
#   bash ferramentas/exportar-sistema.sh ~/sentinela
#
# Depois basta criar o repositório vazio no GitHub e enviar:
#   git remote add origin <url-do-repositorio>
#   git push -u origin main

set -euo pipefail

destino="${1:-}"
if [ -z "$destino" ]; then
  echo "Uso: bash ferramentas/exportar-sistema.sh <pasta-de-destino>" >&2
  exit 1
fi
if [ -e "$destino" ] && [ -n "$(ls -A "$destino" 2>/dev/null)" ]; then
  echo "A pasta $destino já existe e não está vazia. Escolha outra." >&2
  exit 1
fi

origem="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$destino"
destino="$(cd "$destino" && pwd)"

echo "Copiando a aplicação e o servidor…"
cp -R "$origem/sentinela" "$destino/sentinela"
cp -R "$origem/servidor" "$destino/servidor"
cp "$origem/.gitignore" "$destino/.gitignore"
cp "$origem/.dockerignore" "$destino/.dockerignore"
rm -rf "$destino/servidor/dados"

cat > "$destino/README.md" <<'TEXTO'
# Sentinela — Gestão Jurídica

Sistema de gestão de escritório de advocacia orientado a um único objetivo
central: **impedir que um prazo importante passe despercebido.**

## Executar

```bash
cd servidor
npm start
# abra http://localhost:3000
```

Requer apenas Node.js 22 ou superior. No primeiro início o terminal mostra o
e-mail e a senha do administrador.

## Onde está cada coisa

| Pasta | Conteúdo |
| --- | --- |
| `sentinela/` | Aplicação: interface, regras de prazo, publicações e relatórios |
| `servidor/` | Backend: API, banco de dados, autenticação e permissões |
| `sentinela/docs/` | Arquitetura, regras de contagem de prazo e etapas seguintes |

Instruções de uso, testes e publicação com HTTPS em
[`sentinela/README.md`](sentinela/README.md) e
[`servidor/README.md`](servidor/README.md).

## Testes

```bash
node sentinela/testes/testes.mjs   # regras de prazo, publicações e conflitos
node servidor/testes/testes.mjs    # autenticação, permissões e sincronização
```

## Aviso

Os dados do escritório ficam em `servidor/dados`, fora do controle de versão.
Nunca envie essa pasta nem backups em JSON para um repositório: eles contêm
informação de clientes e processos, protegida por sigilo profissional.
TEXTO

cd "$destino"
git init -q -b main
git add .
git commit -q -m "Sentinela: sistema de gestão jurídica com controle de prazos"

echo
echo "Pronto. Projeto extraído em: $destino"
echo "Arquivos versionados: $(git ls-files | wc -l | tr -d ' ')"
echo
echo "Próximo passo: crie um repositório VAZIO e privado no GitHub e execute"
echo "  cd $destino"
echo "  git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git"
echo "  git push -u origin main"
