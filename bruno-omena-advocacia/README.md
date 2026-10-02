# Bruno Omena Advocacia — site institucional

Site one-page em HTML, CSS e JavaScript puros, sem dependências nem etapa de build.
Basta abrir `index.html` ou publicar a pasta em qualquer hospedagem estática.

## Publicação

Cada envio à branch `main` publica o site no GitHub Pages pelo workflow
`.github/workflows/pages.yml`. Na primeira vez, é preciso ativar o Pages em
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Antes de publicar

| O que | Onde |
| --- | --- |
| Instagram (WhatsApp e e-mail já configurados) | bloco `CONFIG` no início de `script.js` |
| Número da OAB | `index.html`, buscar por `[INSERIR NÚMERO]` (seção Sobre e rodapé) |
| Logomarca oficial | substituir `assets/logo.svg` (mesmo nome) |
| Fotografia profissional | salvar em `assets/` e trocar o `src` da imagem na seção Sobre |

As mensagens iniciais do WhatsApp ficam no objeto `MENSAGENS` em `script.js`.
Os links das seções de Direito da Saúde e Direito Médico usam a mensagem da área,
e o link de cada card acrescenta o tema (por exemplo, "negativa de cobertura").
O botão flutuante acompanha a área visível na tela.

## Estrutura

- `index.html`: conteúdo, ícones (SVG inline), SEO e textos legais
- `styles.css`: identidade visual e responsividade
- `script.js`: links do WhatsApp, accordions, menu móvel e animações de entrada
