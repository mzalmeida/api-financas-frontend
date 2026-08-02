# API Financas - Frontend

Frontend estatico em HTML, CSS e JavaScript puro para login, restauracao de sessao, consulta das views financeiras e logout.

## Estado da F03-E01

- o login usa apenas `usuario` e `senha`;
- o campo `linkedin` saiu do fluxo funcional;
- a sessao fica em `localStorage` como payload estruturado;
- o frontend tenta restauracao por `/auth/me` e refresh por `/auth/refresh`;
- as chamadas protegidas enviam `Authorization: Bearer <access_token>`;
- erros 401 limpam a sessao e devolvem o usuario para a tela de login sem loops de `alert`;
- a renderizacao das tabelas usa APIs de DOM com `textContent`, sem `innerHTML` para os dados das views.

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
- apenas mensagens de erro genericas devem aparecer para o usuario;
- `indexantg.html` permanece somente como legado de referencia e nao como fluxo oficial.
