# RebeccaCash - Frontend

Frontend estatico em HTML, CSS e JavaScript puro do RebeccaCash para login, restauracao de sessao, dashboard, central de importacoes, CRUDs e configuracoes do portal.

## Estado da F03-E02

- o login usa apenas `usuario` e `senha`;
- o campo `linkedin` saiu do fluxo funcional;
- a sessao fica em `localStorage` como payload estruturado;
- o frontend tenta restauracao por `/auth/me` e refresh por `/auth/refresh`;
- as chamadas protegidas enviam `Authorization: Bearer <access_token>`;
- erros 401 limpam a sessao e devolvem o usuario para a tela de login sem loops de `alert`;
- a renderizacao das tabelas usa APIs de DOM com `textContent`, sem `innerHTML` para os dados das views.
- o fluxo oficial agora inclui `Esqueci minha senha`, solicitacao de e-mail, tela de nova senha, confirmacao e tratamento de `PASSWORD_RECOVERY`.
- a senha nova segue direto para o Supabase Auth no navegador e nao passa pelo backend.
- em producao, o redirect de recuperacao foi fixado explicitamente em `https://api-financas-frontend.onrender.com`.

## API esperada

- local: `http://127.0.0.1:3000`
- publico: `https://api-financas-backend1.onrender.com`

O arquivo `app.js` escolhe a URL local automaticamente em `localhost` e a URL publica fora do ambiente local.

## Estado publico da F03-E01-R1

- URL publica validada: `https://api-financas-frontend.onrender.com`
- backend publico validado: `https://api-financas-backend1.onrender.com`
- commit corretivo de rollout: `984d237 - Point frontend to Render backend service`
- o HTML publico nao exibe mais o campo `linkedin`
- o fluxo publicado usa restauracao de sessao, refresh, logout e bearer token do Supabase

## Fluxo de sessao

1. Usuario faz login.
2. O frontend salva a sessao retornada pelo backend.
3. Cada requisicao protegida envia o access token do Supabase.
4. Se a sessao expirar, o frontend tenta refresh.
5. Se o refresh falhar, a sessao e removida e a tela de login volta a ser exibida.

## Seguranca

- nenhuma chave privada do Supabase deve existir no bundle;
- `service_role` e proibida no frontend;
- apenas `SUPABASE_URL` e `SUPABASE_ANON_KEY` podem ser expostos para o fluxo restrito de recuperacao;
- apenas mensagens de erro genericas devem aparecer para o usuario;
- `indexantg.html` permanece somente como legado de referencia e nao como fluxo oficial.

## Estado local da F04-E01

- o frontend foi redesenhado como portal responsivo com cabecalho, menu principal, cards de resumo e secoes separadas;
- a secao `Importar OFX` passou a oferecer:
  - selecao ou arraste de arquivo `.ofx`;
  - selecao de instituicao e conta financeira;
  - criacao orientada de conta financeira;
  - preview antes da gravacao definitiva;
  - confirmacao da importacao;
  - historico com detalhes e cancelamento de importacoes nao confirmadas;
- a navegacao continua em HTML, CSS e JavaScript puro, sem framework adicional;
- o fluxo de recuperacao de senha publicado foi preservado com `redirectTo` apontando somente para `https://api-financas-frontend.onrender.com`;
- o frontend continua sem `service_role` e sem uso de `innerHTML` para dados retornados pela API funcional.
- nenhuma referencia funcional a Gmail permanece no frontend publicado;
- o portal passa a destacar o fluxo oficial atual: upload manual de OFX, preview, confirmacao e historico;
- qualquer automacao por e-mail fica registrada apenas como capacidade futura, usando somente a mensagem "Automacao de importacao planejada para versoes futuras.".

## Estado local da RC 1.0

- o sistema passou a adotar oficialmente a marca `RebeccaCash`, com logo, favicon, manifest e identidade visual centralizada no frontend;
- o portal agora opera com menu lateral funcional para:
  - Dashboard
  - Importacoes
  - Historico
  - Categorias
  - Contas
  - Cartoes
  - Fornecedores
  - Configuracoes
  - Perfil
  - Sair
- o dashboard passou a mostrar saldo total, receitas, despesas, transferencias, ultima importacao, quantidade de contas, cartoes, categorias e total de transacoes;
- a central de importacoes ganhou busca, filtro por status, paginacao visual e painel lateral de detalhes;
- os cadastros passaram a usar CRUD real sobre os endpoints `/portal/catalog/*`;
- configuracoes e perfil deixaram de ser placeholders e passaram a persistir nome, tema e preferencias reais do usuario;
- a troca de senha passou a poder ser iniciada de dentro do proprio portal, usando a sessao autenticada do Supabase no navegador;
- a identidade visual foi refeita com layout premium, sidebar mobile, cards, graficos em CSS, toasts e paleta inspirada no logotipo oficial do RebeccaCash.

## Estado visual final da RC 1.0

- a marca comercial oficial RebeccaCash aparece no `title`, no login, na sidebar, no cabecalho, no manifest e nos favicons do frontend;
- a identidade visual foi consolidada com paleta clara, tipografia Inter, cards brancos, bordas suaves e botoes padronizados;
- a sidebar ficou mais larga, mais legivel e sem quebra indevida de texto;
- a area de configuracoes passou a enfatizar organizacao, cadastro global e continuidade do fluxo manual oficial;
- o perfil ganhou resumo visual com avatar por iniciais para contas sem foto;
- a responsividade do menu, das tabelas e das barras de acao foi endurecida para reduzir overflow horizontal em telas pequenas.

## Estado local da F05

- o dashboard passou a destacar saldo geral, receitas, despesas, resultado, contas financeiras, fatura de cartao e resumo de parcelamentos;
- filtros globais de competencia, banco, conta, tipo e categoria passaram a dirigir dashboard, movimentacoes e duplicidades;
- o menu ganhou as secoes `Movimentacoes`, `Duplicidades` e `Parcelamentos`;
- `Contas Financeiras` passou a expor tipos como `wallet`, `manual` e `credit_card` tambem no fluxo rapido de importacao;
- o cadastro manual de parcelamentos gera a base operacional para compromissos mensais antes mesmo da importacao OFX.
