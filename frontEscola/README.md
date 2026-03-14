# Front Escola

Frontend simples em Vue 3 com tres telas:

- Login chamando `/auth/login`
- Dashboard com dados do usuario autenticado
- Notas filtradas por perfil

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

## Persistencia

O JWT e os dados basicos do usuario ficam salvos em `localStorage` nas chaves `escola.jwt` e `escola.user`.
