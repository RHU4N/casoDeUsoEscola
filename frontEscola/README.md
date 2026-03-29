# Front Escola

Frontend em Vue 3 com arquitetura em componentes e camada de consumo de API.

## Estrutura principal

- `src/composables/useSchoolDashboard.js`: estado da sessao, login, chamada de endpoints e regras por perfil
- `src/components/SchoolHero.vue`: bloco visual institucional da tela de acesso
- `src/components/LoginCard.vue`: formulario de autenticacao
- `src/components/WorkspaceSidebar.vue`: navegacao lateral da area logada
- `src/components/DashboardView.vue`: cards e resumo do perfil
- `src/components/GradesView.vue`: tabela de notas e estados de carregamento/erro
- `src/components/UserRegistrationView.vue`: cadastro de usuarios para perfil admin
- `src/components/UploadCenterView.vue`: upload com progresso e historico local
- `src/App.vue`: orquestracao dos componentes

## Como executar

1. Suba o backend em `http://localhost:3000`.
2. No frontend, rode `npm install`.
3. Rode `npm run dev`.

O Vite esta configurado para fazer proxy de `/api` para `http://localhost:3000`, evitando problema de CORS em desenvolvimento.

## Configuracao opcional

Se quiser apontar para outra API, defina `VITE_API_URL` em um arquivo `.env`, por exemplo:

```env
VITE_API_URL=http://localhost:3000/api
```

## Consumo da API

- Login: `POST /auth/login`
- Notas de aluno: `GET /grades/my`
- Notas de professor/admin: `GET /grades`
- Perfil detalhado: `GET /usuarios/:id` (somente quando o usuario logado e admin)
- Cadastro de usuario: `POST /usuarios` (somente admin)
- Upload de arquivo: `POST /uploads` (usuario autenticado)

O token JWT e os dados basicos do usuario ficam em `localStorage` nas chaves `escola.jwt` e `escola.user`.

## Persistencia

O JWT e os dados basicos do usuario ficam salvos em `localStorage` nas chaves `escola.jwt` e `escola.user`.
