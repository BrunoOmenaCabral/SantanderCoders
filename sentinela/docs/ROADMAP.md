# Etapas

## Entregue nesta versão (MVP)

Login e perfis de acesso · dashboard com calendário mensal · agenda com quatro visões e
filtros · clientes · processos com número CNJ único · prazos com motor de contagem e
memória de cálculo · alertas e central de notificações · tarefas · audiências · linha do
tempo do processo · documentos · busca global · relatórios gerenciais · relatório do
cliente · financeiro básico · comunicações com histórico · auditoria · lixeira · backup ·
interface responsiva · estrutura pronta para publicações, WhatsApp e IA.

## Próxima etapa — depende de backend

1. **Servidor e banco de dados.** Substituir `core/store.js` por API HTTP, mover a
   autorização para o servidor e habilitar acesso multiusuário simultâneo.
2. **Captura automática de publicações.** Contratar provedor de monitoramento e
   preencher o ponto de extensão de `publicacoes.consultar`. A fila de conferência já
   está pronta para receber o volume.
3. **WhatsApp oficial.** Conta no WhatsApp Business, token e fila de envio com
   confirmação de entrega.
4. **E-mail transacional.** Servidor de envio, com registro do e-mail no processo.
5. **Leitura por modelo de linguagem.** Substituir a heurística local mantendo o mesmo
   contrato de retorno e a obrigatoriedade de confirmação humana.

## Etapa seguinte

6. Sincronismo com Google, Apple e Outlook Calendar, mantendo o sistema como fonte
   principal.
7. Consulta processual e integrações com PJe, e-SAJ, eproc, Projudi e diários oficiais.
8. Assinatura eletrônica e certificado digital.
9. Armazenamento de documentos em nuvem (Drive, OneDrive, S3).
10. Aplicativo instalável (PWA) com notificações push e uso offline.
11. Financeiro completo: contrato de honorários gerado, cobrança, conciliação e
    relatório econômico por cliente.
