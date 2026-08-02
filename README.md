# API Financas - Frontend

Frontend estatico em HTML, CSS e JavaScript puro para login, restauracao de sessao, consulta das views financeiras e logout.

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
- a aba Gmail foi ocultada do portal publicado para nao expor uma funcionalidade ainda nao ativada;
- o portal passa a destacar o fluxo oficial atual: upload manual de OFX, preview, confirmacao e historico;
- qualquer automacao por e-mail fica registrada apenas como capacidade futura, sem botoes quebrados e sem dependencia de Google OAuth nesta etapa.
