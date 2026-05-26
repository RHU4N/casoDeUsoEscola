# Roteiro de teste do sistema escolar

Este roteiro cobre o fluxo de acesso e os caminhos principais do site, incluindo o login para cada tipo de usuário suportado pelo sistema.

## Premissas

- Backend em execução em `http://localhost:3000`.
- Frontend em execução com Vite.
- Dados de teste preparados com `npm run seed:test-users` dentro de `backEscola`.

## Credenciais de teste

Senha padrão para todos os usuários de teste: `Escola@2026`

- Admin: `admin@escola.com`
- Professor: `professor@escola.com`
- Aluno 1: `aluno1@escola.com`
- Aluno 2: `aluno2@escola.com`

## Fluxo geral de teste

1. Abrir a tela inicial do frontend.
2. Validar que a área logada não aparece antes do login.
3. Efetuar login com cada perfil abaixo, um de cada vez.
4. Confirmar as permissões visíveis na interface e os endpoints carregados no painel.
5. Fazer logout e repetir com o próximo perfil.

## Teste por perfil

### 1) Login como aluno

Use `aluno1@escola.com` ou `aluno2@escola.com` com a senha padrão.

Resultado esperado:

- O login deve ser aceito.
- O painel deve mostrar o perfil como `Aluno`.
- A área de notas deve carregar apenas as notas do próprio aluno.
- O card de média atual deve aparecer.
- A barra lateral deve mostrar somente `Dashboard`, `Notas`, `Uploads` e `Encerrar sessao`.
- A opção de cadastro de usuário não deve aparecer.

Verificações técnicas esperadas:

- `GET /api/grades/my`
- `GET /api/usuarios/me`
- `POST /api/uploads`

### 2) Login como professor

Use `professor@escola.com` com a senha padrão.

Resultado esperado:

- O login deve ser aceito.
- O painel deve mostrar o perfil como `Professor`.
- A área de notas deve carregar a visão geral das notas.
- A lista de alunos deve estar disponível para apoio ao lançamento.
- A barra lateral deve mostrar `Dashboard`, `Notas`, `Uploads` e `Encerrar sessao`.
- A opção de cadastro de usuário não deve aparecer.

Verificações técnicas esperadas:

- `GET /api/grades`
- `GET /api/usuarios/alunos`
- `POST /api/grades` para criar nota
- `PUT /api/grades/:id` para editar nota
- `DELETE /api/grades/:id` para remover nota

### 3) Login como administrador

Use `admin@escola.com` com a senha padrão.

Resultado esperado:

- O login deve ser aceito.
- O painel deve mostrar o perfil como `Administrador`.
- A área de notas deve mostrar a visão completa.
- A opção `Cadastrar usuario` deve aparecer na barra lateral.
- O administrador deve conseguir listar, criar, editar e excluir usuários.

Verificações técnicas esperadas:

- `GET /api/grades`
- `GET /api/usuarios/alunos`
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

## Testes negativos

1. Tentar entrar com senha incorreta e confirmar mensagem de credenciais inválidas.
2. Tentar acessar uma rota protegida sem token e confirmar resposta `401`.
3. Tentar usar um perfil sem permissão em uma rota restrita e confirmar resposta `403`.
4. Tentar logar sem preencher email ou senha e confirmar validação de formulário.

## Critério de aceite

O teste é considerado aprovado quando:

- Cada perfil consegue fazer login com sucesso.
- A interface muda conforme o papel do usuário.
- As rotas protegidas respeitam `student`, `teacher` e `admin`.
- As tentativas indevidas retornam `401` ou `403` conforme o caso.