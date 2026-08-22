# Caso de Uso Escola

Sistema escolar online full stack para autenticação de usuários, consulta e gerenciamento de notas, cadastro de usuários e upload de documentos. A aplicação possui um frontend em Vue 3 e uma API REST em Node.js com persistência em MySQL.

## Funcionalidades

- login e cadastro de usuários;
- perfis de aluno, professor e administrador;
- dashboard acadêmico com indicadores;
- consulta de notas próprias para alunos;
- consulta geral e gerenciamento de notas para professores;
- gerenciamento de usuários para administradores;
- upload de documentos autenticado;
- histórico local de uploads no frontend;
- controle de acesso por papel com JWT;
- validação de dados, CORS, Helmet e rate limiting;
- interface de documentação e teste por endpoints no roteiro de fluxo.

## Arquitetura

```text
Navegador
   │
   │ Vue 3 + Vite
   ▼
frontEscola (:5173)
   │
   │ HTTP /api + Bearer JWT
   ▼
backEscola (:3000)
   │
   ├── Express REST API
   ├── Sequelize
   └── MySQL
```

## Perfis de acesso

| Perfil | Permissões principais |
| --- | --- |
| `student` | Visualizar as próprias notas, perfil e enviar uploads |
| `teacher` | Visualizar alunos, listar, criar, editar e excluir notas, enviar uploads |
| `admin` | Gerenciar usuários, visualizar notas e enviar uploads |

## Estrutura do projeto

```text
casoDeUsoEscola/
├── README.md
├── TESTE_FLUXO.md
├── backEscola/
│   ├── server.js                    # Inicialização da API
│   ├── index.js                     # Entrada auxiliar
│   ├── package.json
│   ├── .env.example
│   ├── config/                      # Banco e JWT
│   ├── controllers/                 # Regras dos recursos
│   ├── middleware/                  # Auth, upload, validação e erros
│   ├── models/                      # Modelos Sequelize
│   ├── routes/                      # Rotas REST
│   └── scripts/seedTestUsers.js     # Usuários de teste
└── frontEscola/
    ├── package.json
    ├── vite.config.js               # Proxy para o backend
    ├── index.html
    └── src/
        ├── App.vue
        ├── components/              # Telas e modais
        ├── composables/             # Estado e chamadas da API
        └── style.css
```

## Tecnologias

### Backend

- Node.js;
- Express 5;
- Sequelize 6;
- MySQL2;
- JSON Web Token;
- bcryptjs;
- Multer;
- express-validator;
- Helmet;
- CORS;
- express-rate-limit.

### Frontend

- Vue 3;
- Vite 8;
- JavaScript;
- CSS.

## Requisitos

- Node.js e npm;
- MySQL ou acesso a um servidor MySQL compatível;
- navegador moderno.

## Configuração do backend

Entre na pasta do backend e copie o arquivo de exemplo:

```bash
cd backEscola
copy .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

Preencha o `.env` com as credenciais do banco e um segredo JWT forte. As variáveis principais são:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=escoladb
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
DB_AUTO_CREATE=false
DB_SYNC=true
JWT_SECRET=defina_um_segredo_forte_e_unico
JWT_EXPIRES_IN=1d
CORS_ORIGINS=http://localhost:5173
CORS_ALLOW_LOCALHOST=true
```

Para um banco remoto com SSL, ajuste `DB_HOST`, `DB_SSL` e as demais credenciais conforme o provedor. Não versione o arquivo `.env` nem credenciais reais.

## Instalação e execução

### Backend

```bash
cd backEscola
npm install
npm run dev
```

Para iniciar sem o Nodemon:

```bash
npm start
```

A API estará disponível em `http://localhost:3000`.

Verificação de saúde:

```http
GET /api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "backEscola"
}
```

### Usuários de teste

Com o backend configurado e o banco acessível, crie os usuários de teste:

```bash
cd backEscola
npm run seed:test-users
```

Senha padrão dos usuários de teste: `Escola@2026`.

| Perfil | E-mail |
| --- | --- |
| Administrador | `admin@escola.com` |
| Professor | `professor@escola.com` |
| Aluno | `aluno1@escola.com` ou `aluno2@escola.com` |

### Frontend

Em outro terminal:

```bash
cd frontEscola
npm install
npm run dev
```

O frontend será disponibilizado pelo Vite, normalmente em `http://localhost:5173`. O proxy configurado encaminha as requisições `/api` para `http://localhost:3000`.

Para gerar a versão de produção:

```bash
npm run build
```

## Principais endpoints

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Cadastra usuário |
| `POST` | `/api/auth/login` | Autentica e retorna JWT |

Exemplo de login:

```json
{
  "email": "aluno1@escola.com",
  "password": "Escola@2026"
}
```

Use o token retornado nas rotas protegidas:

```text
Authorization: Bearer seu-token-jwt
```

### Usuários

Todas as rotas exigem autenticação. O gerenciamento completo é exclusivo do administrador.

| Método | Rota | Permissão |
| --- | --- | --- |
| `GET` | `/api/usuarios/me` | Usuário autenticado |
| `GET` | `/api/usuarios/alunos` | Professor ou administrador |
| `GET` | `/api/usuarios` | Administrador |
| `GET` | `/api/usuarios/:id` | Administrador |
| `POST` | `/api/usuarios` | Administrador |
| `PUT` | `/api/usuarios/:id` | Administrador |
| `DELETE` | `/api/usuarios/:id` | Administrador |

### Notas

Todas as rotas de notas exigem autenticação.

| Método | Rota | Permissão |
| --- | --- | --- |
| `GET` | `/api/grades/my` | Aluno |
| `GET` | `/api/grades` | Professor ou administrador |
| `GET` | `/api/grades/:id` | Professor ou administrador |
| `POST` | `/api/grades` | Professor |
| `PUT` | `/api/grades/:id` | Professor |
| `DELETE` | `/api/grades/:id` | Professor |

A rota `/api/notas` é um alias para as rotas de notas.

### Uploads

```http
POST /api/uploads
```

Exige autenticação e recebe `multipart/form-data` com um arquivo no campo `file`.

## Testes de fluxo

O arquivo [TESTE_FLUXO.md](TESTE_FLUXO.md) contém o roteiro de validação manual para os perfis de aluno, professor e administrador, incluindo testes negativos de credenciais, respostas `401` e `403` e permissões por papel.

## Segurança

- Senhas são protegidas com `bcryptjs` no backend.
- Tokens são assinados com JWT e possuem expiração configurável.
- Rotas sensíveis usam autenticação e autorização por papel.
- Helmet, CORS e rate limiting estão habilitados.
- Use segredos exclusivos em ambientes reais e não publique `.env`.
- Revise os limites de upload e as permissões antes de disponibilizar o sistema em produção.

## Status

Projeto acadêmico em desenvolvimento para praticar uma aplicação full stack com Vue, API REST, autenticação, autorização, persistência relacional e upload de arquivos.
