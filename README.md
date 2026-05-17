# Sistema de Gerenciamento de Planos de Aula

Plataforma para cadastro, organização e consulta de planos de aula, com integração de IA para recomendar conteúdos complementares.

## Stack
- **Frontend:** TypeScript, Vite, React, Tailwind CSS v3, React Router, React Hook Form, Zod, TanStack Query, Axios.
- **Backend:** JavaScript, Node.js, Express, Zod, Pino, Axios, pg (conexão com o banco).
- **Banco:** PostgreSQL.
- **Testes:** Jest, Supertest.
- **IA:** Google AI Studio (Gemini).
- **Tooling:** ESLint, Prettier, Nodemon.
- **Infra:** Docker, Nginx.

## Pré-requisitos
- Node.js 20+ e npm 10+.
- PostgreSQL 15+ acessível.
- API Key do Google AI Studio (necessária para o recurso Smart Assist).

## Setup
```bash
git clone https://github.com/danielrmendonca/Sistema-de-Gerenciamento-de-Planos-de-Aula.git
cd Sistema-de-Gerenciamento-de-Planos-de-Aula

cd backend
npm install

cd ../frontend
npm install
cd ..

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Rodando em desenvolvimento
Dois terminais:
```bash
# backend (porta 3000)
cd backend && npm run dev

# frontend (porta 5173, com proxy /api -> :3000)
cd frontend && npm run dev
```
- Front: http://localhost:5173
- Health: http://localhost:3000/health


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

## Decisões arquiteturais
- **Backend em camadas** (controller, service, repository) para separar HTTP, regras de negócio e acesso a banco.
- **Zod nos dois lados** para validar entrada do back e do formulário do front com a mesma biblioteca.
- **Pino** para logs estruturados, incluindo latência e tokens em chamadas à IA.
- **Proxy do Vite** `/api` para o backend em dev, evitando configuração específica de CORS.
- **TanStack Query** no front para cache, loading e erros de forma declarativa.
- **Persona Prompting e Output Formatting** no Smart Assist: a IA atua como "Assistente Pedagógico" e responde em JSON estruturado.