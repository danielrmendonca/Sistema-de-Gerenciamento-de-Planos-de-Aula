# Sistema de Gerenciamento de Planos de Aula

Plataforma para cadastro, organização e consulta de planos de aula, com integração de IA para recomendar conteúdos complementares.

## Stack
- **Frontend:** TypeScript, Vite, React, Tailwind CSS v3, React Router, React Hook Form, Zod, TanStack Query, Axios.
- **Backend:** JavaScript (CommonJS - `require`/`module.exports`), Node.js, Express, Zod, Pino, Axios, pg (conexão com o banco).
- **Banco:** PostgreSQL.
- **Testes:** Jest, Supertest.
- **IA:** Google AI Studio (Gemini).
- **Tooling:** ESLint, Prettier, Nodemon.
- **Infra:** Docker, Nginx.

## Pré-requisitos
- Node.js 20+ e npm 10+.
- Docker (para subir o banco de dados PostgreSQL).
- API Key do Google AI Studio (necessária para o recurso Smart Assist).

## Como rodar em desenvolvimento

### 1. Clonar e instalar dependências
```bash
git clone https://github.com/danielrmendonca/Sistema-de-Gerenciamento-de-Planos-de-Aula.git
cd Sistema-de-Gerenciamento-de-Planos-de-Aula

cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configurar variáveis de ambiente
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Abra `backend/.env` e preencha `GOOGLE_AI_API_KEY` com sua chave do Google AI Studio. As demais variáveis já estão com os valores padrão.

### 3. Subir o banco de dados (Docker)
O projeto usa um container Docker apenas para o PostgreSQL em desenvolvimento. Não é necessário instalar o PostgreSQL na máquina.

```bash
docker run -d \
  --name lesson-plans-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lesson_plans \
  -p 5432:5432 \
  postgres:15-alpine
```

Aguarde alguns segundos e verifique se o banco subiu:
```bash
docker exec lesson-plans-db psql -U postgres -d lesson_plans -c "SELECT 1"
# Deve retornar: ?column? = 1
```

### 4. Rodar a migration
Cria a tabela `lesson_plans` no banco:
```bash
docker exec lesson-plans-db psql -U postgres -d lesson_plans \
  -f /dev/stdin < backend/src/db/migrations/001_create_lesson_plans.sql
```

No Windows (PowerShell), use:
```powershell
Get-Content backend\src\db\migrations\001_create_lesson_plans.sql |
  docker exec -i lesson-plans-db psql -U postgres -d lesson_plans
```

### 5. Iniciar a aplicação
Abra dois terminais:
```bash
# Terminal 1 - backend (porta 3000)
cd backend && npm run dev

# Terminal 2 - frontend (porta 5173)
cd frontend && npm run dev
```

Acesse:
- Frontend: http://localhost:5173
- Health check: http://localhost:3000/health

### Sessoes seguintes
O container do banco persiste os dados. Para as proximas vezes, basta iniciar o container e a aplicacao:
```bash
docker start lesson-plans-db

# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```


## Estrutura
```
.
├── backend/                 API Node.js + Express
│   ├── src/
│   │   ├── config/          env (Zod), db (pg), logger (Pino)
│   │   ├── controllers/     camada HTTP
│   │   ├── services/        regras de negócio
│   │   ├── repositories/    acesso a banco
│   │   ├── routes/          rotas Express
│   │   ├── validators/      schemas Zod de entrada
│   │   ├── middlewares/     validate, error-handler, request-logger
│   │   ├── utils/           http-error
│   │   ├── db/migrations/   SQLs de migração
│   │   ├── app.js           configuração do Express
│   │   └── index.js         bootstrap
│   ├── tests/               Jest + Supertest
│   ├── nginx/               Configurações de Proxy
│   └── .env.example
│
└── frontend/                SPA Vite + React + TS + Tailwind
    ├── src/
    │   ├── api/             cliente Axios e endpoints
    │   ├── components/      ui, layout, feature
    │   ├── pages/           listagem, formulário, 404
    │   ├── schemas/         schemas Zod do formulário
    │   ├── types/           tipos de domínio
    │   ├── lib/             query-client
    │   ├── router.tsx       rotas
    │   ├── App.tsx          providers
    │   └── main.tsx         entry point
    └── .env.example
```

## Scripts úteis
| Diretório | Comando            | O que faz                          |
| --------- | ------------------ | ---------------------------------- |
| backend   | `npm test`         | Jest + Supertest                   |
| backend   | `npm run lint`     | ESLint                             |
| backend   | `npm run format`   | Prettier write                     |
| frontend  | `npm run build`    | TypeScript check + build Vite      |
| frontend  | `npm run lint`     | ESLint                             |
| frontend  | `npm run format`   | Prettier write                     |

## Variáveis de ambiente

### backend/.env
| Variável                | Default            |
| ----------------------- | ------------------ |
| `NODE_ENV`              | `development`      |
| `PORT`                  | `3000`             |
| `DB_HOST`               | `localhost`        |
| `DB_PORT`               | `5432`             |
| `DB_NAME`               | `lesson_plans`     |
| `DB_USER`               | `postgres`         |
| `DB_PASSWORD`           |                    |
| `GOOGLE_AI_API_KEY`     |                    |
| `GOOGLE_AI_MODEL`       | `gemini-1.5-flash` |
| `GOOGLE_AI_TIMEOUT_MS`  | `15000`            |
| `LOG_LEVEL`             | `info`             |
| `CORS_ORIGIN`           | `*`                |

### frontend/.env
| Variável        | Default |
| --------------- | ------- |
| `VITE_API_URL`  | `/api`  |

## Endpoints
| Método | Rota                       | Descrição                                |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/health`                  | Status da API e do banco                 |
| GET    | `/api/lesson-plans`        | Lista paginada com filtros e ordenação   |
| GET    | `/api/lesson-plans/:id`    | Busca um plano por id                    |
| POST   | `/api/lesson-plans`        | Cria um plano                            |
| PUT    | `/api/lesson-plans/:id`    | Atualiza um plano                        |
| DELETE | `/api/lesson-plans/:id`    | Remove um plano                          |
| POST   | `/api/ai/smart-assist`     | Gera recomendações via Gemini            |

## Arquitetura do backend

O backend segue uma arquitetura em camadas onde cada arquivo tem uma responsabilidade única. O fluxo de uma requisição passa por todas elas em sequência:

```
Requisição HTTP -> Rota -> Middleware (validate) -> Controller -> Service -> Repository -> Banco
```

**Rotas** (`src/routes/`)
Conectam método HTTP + caminho a uma função do controller. Também encadeiam o middleware de validação antes do controller, garantindo que dados inválidos sejam rejeitados antes de qualquer lógica de negócio.

```js
router.get('/:id', validate({ params: idParamsSchema }), controller.getById);
```

**Controller** (`src/controllers/`)
Recebe `req` e `res`, extrai os dados da requisição, delega ao service e devolve a resposta HTTP. Não conhece SQL e não aplica regras de negócio.

**Service** (`src/services/`)
Aplica as regras de negócio. Verifica, por exemplo, se um recurso existe antes de retorná-lo, lançando erro 404 quando o repositório devolve `null`. Não conhece `req` nem `res`.

**Repository** (`src/repositories/`)
Unica camada que fala com o banco. Executa as queries SQL e devolve objetos simples. Converte snake_case do PostgreSQL para camelCase antes de retornar.

Essa separação permite testar cada camada de forma isolada - os testes de integração mockam apenas o repositório, sem precisar de um banco real.

## Integração Contínua (CI)
Workflow do GitHub Actions em `.github/workflows/lint.yml` que roda ESLint e Prettier nos pacotes `backend` e `frontend` a cada `push` (qualquer branch) e em `pull_request` para `main`.

### Como funciona
- Dois jobs em paralelo via `matrix` (`backend` e `frontend`), com `fail-fast: false` para que a falha de um não cancele o outro.
- Node 20 com cache do npm baseado no `package-lock.json` de cada pacote.
- Em cada job: `npm ci`, `npm run lint` (ESLint) e `npm run format:check` (Prettier em modo verificação).

### Como usar no dia a dia
1. Antes de subir, rode local para evitar check vermelho:
   ```bash
   cd backend  && npm run lint && npm run format:check
   cd ../frontend && npm run lint && npm run format:check
   ```
2. Se algo falhar, corrija com:
   ```bash
   npm run lint:fix     # erros auto-corrigíveis do ESLint
   npm run format       # reformata com Prettier
   ```
3. Faça `git push`. Acompanhe o resultado em:
   - Aba **Actions** do repositório.
   - Bolinha de status (verde/vermelho) ao lado do commit.
   - Bloco **Checks** no rodapé da PR.

### Quando o pipeline dispara
| Evento                                       | Dispara? |
| -------------------------------------------- | -------- |
| `push` em qualquer branch                    | Sim      |
| Abertura, update ou reabertura de PR p/ main | Sim      |
| Edição apenas de arquivos não rastreados     | Não      |

## Decisões arquiteturais
- **Backend em camadas** (controller, service, repository) para separar HTTP, regras de negócio e acesso a banco.
- **Zod nos dois lados** para validar entrada do back e do formulário do front com a mesma biblioteca.
- **Pino** para logs estruturados, incluindo latência e tokens em chamadas à IA.
- **Proxy do Vite** `/api` para o backend em dev, evitando configuração específica de CORS.
- **TanStack Query** no front para cache, loading e erros de forma declarativa.
- **Persona Prompting e Output Formatting** no Smart Assist: a IA atua como "Assistente Pedagógico" e responde em JSON estruturado.