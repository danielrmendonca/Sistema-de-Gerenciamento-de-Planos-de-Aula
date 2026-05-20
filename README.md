# Sistema de Gerenciamento de Planos de Aula

Plataforma para cadastro, organização e consulta de planos de aula, com integração de IA para recomendar conteúdos complementares.

> Vídeo de apresentação (até 5 min): https://drive.google.com/drive/folders/1rAMmaMvWemcIbAflXaXIpRncxMivmS9y?usp=sharing

## Stack
- **Frontend:** TypeScript, Vite, React, Tailwind CSS v3, React Router, React Hook Form, Zod, TanStack Query, Axios.
- **Backend:** JavaScript (CommonJS - `require`/`module.exports`), Node.js, Express, Zod, Pino, Axios, pg (conexão com o banco).
- **Banco:** PostgreSQL.
- **Testes:** Jest, Supertest.
- **IA:** Google AI Studio (Gemini).
- **Tooling:** ESLint, Prettier, Nodemon.
- **Infra:** Docker, Nginx.

## Pré-requisitos
- Docker e Docker Compose.
- API Key do Google AI Studio (necessária para o recurso Smart Assist). Obtenha em https://aistudio.google.com/apikey.

> Para desenvolver com hot reload (HMR) em vez de rodar tudo containerizado, veja [DEV_SETUP_LOCAL.md](./DEV_SETUP_LOCAL.md).

## Como rodar

Sobe banco, backend, frontend (build) e proxy Nginx em quatro containers com um único comando. Tudo passa pela porta 80 do host.

### 1. Clonar e configurar a chave da IA
```bash
git clone https://github.com/danielrmendonca/Sistema-de-Gerenciamento-de-Planos-de-Aula.git
cd Sistema-de-Gerenciamento-de-Planos-de-Aula

cp backend/.env.example backend/.env
```
Abra `backend/.env` e preencha `ADICIONE_SUA_CHAVE_AQUI` com sua chave. As outras variáveis já estão com defaults adequados; o `docker-compose.yml` sobrescreve `DB_HOST`, `CORS_ORIGIN` e `NODE_ENV` para o ambiente containerizado.

### 2. Subir tudo
```bash
docker compose up --build -d
```

Na primeira vez o build leva 1-2 minutos. A migration `001_create_lesson_plans.sql` roda automaticamente na inicialização do banco (volume vazio).

### 3. Acessar
- Aplicação: http://localhost/
- Health check: http://localhost/health
- API: http://localhost/api/lesson-plans

### Comandos úteis
```bash
docker compose ps              # status dos containers
docker compose logs -f backend # logs de um servico especifico
docker compose down            # para tudo (mantem o volume do banco)
docker compose down -v         # para tudo E apaga o volume do banco
docker compose up --build -d   # rebuilda imagens e sobe novamente
```

## Estrutura
```
.
├── docker-compose.yml       orquestra db + backend + frontend + proxy
│
├── backend/                 API Node.js + Express
│   ├── src/
│   │   ├── config/          env (Zod), db (pg), logger (Pino)
│   │   ├── controllers/     camada HTTP
│   │   ├── services/        regras de negócio (inclui ai.service.js)
│   │   ├── repositories/    acesso a banco
│   │   ├── routes/          rotas Express
│   │   ├── validators/      schemas Zod de entrada
│   │   ├── middlewares/     validate, error-handler, request-logger
│   │   ├── utils/           http-error
│   │   ├── db/migrations/   SQLs de migração (rodam no init do Postgres)
│   │   ├── app.js           configuração do Express
│   │   └── index.js         bootstrap
│   ├── tests/               Jest + Supertest
│   ├── nginx/default.conf   configuração do proxy reverso (servido pelo container proxy)
│   ├── Dockerfile           imagem de produção do backend
│   └── .env.example
│
└── frontend/                SPA Vite + React + TS + Tailwind
    ├── src/
    │   ├── api/             cliente Axios e endpoints
    │   ├── components/      ui (Button, Input, Select, Textarea, TagInput, Spinner), layout
    │   ├── pages/           listagem, formulário, 404
    │   ├── hooks/           useDebouncedValue
    │   ├── schemas/         schemas Zod do formulário
    │   ├── types/           tipos de domínio
    │   ├── lib/             query-client
    │   ├── router.tsx       rotas
    │   ├── App.tsx          providers
    │   └── main.tsx         entry point
    ├── nginx.conf           configuração do nginx interno do frontend (SPA + try_files)
    ├── Dockerfile           multi-stage: build Vite + servir estático no nginx
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
| `DB_PASSWORD`           | `postgres`         |
| `GOOGLE_AI_API_KEY`     | `ADICIONE_SUA_CHAVE_AQUI` |
| `GOOGLE_AI_MODEL`       | `gemini-3.1-flash-lite` |
| `GOOGLE_AI_TIMEOUT_MS`  | `15000`            |
| `LOG_LEVEL`             | `info`             |
| `CORS_ORIGIN`           | `http://localhost:5173` |

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

## Infraestrutura (Docker Compose)

Quatro serviços no `docker-compose.yml`, todos na mesma rede interna criada pelo Compose, com apenas o proxy expondo porta ao host:

```
Navegador --> http://localhost (porta 80)
                    |
                    v
              [proxy: nginx]   <- unica porta exposta
              /            \
             /              \
       / e /*           /api/*, /health
            |                |
            v                v
     [frontend: nginx]   [backend: node]
     (SPA estatica)           |
                              v
                         [db: postgres]
                         (volume persistente)
```

- **db**: `postgres:15-alpine` com healthcheck via `pg_isready`. O backend só sobe depois que o banco está pronto. A migration é montada em `/docker-entrypoint-initdb.d` e roda automaticamente no primeiro init.
- **backend**: build a partir de `backend/Dockerfile` (Node 20 alpine, `npm ci --omit=dev`). Lê as variáveis de `backend/.env`, mas o Compose sobrescreve `DB_HOST=db` e `CORS_ORIGIN=http://localhost`.
- **frontend**: multi-stage. O primeiro stage builda o SPA com Vite; o segundo copia o `dist` para `nginx:alpine` com `try_files $uri $uri/ /index.html` (para rotas client-side do React Router não darem 404 ao recarregar).
- **proxy**: `nginx:alpine` com config montada de `backend/nginx/default.conf`. Roteia `/api/*` e `/health` para `backend:3000` e qualquer outra rota para `frontend:80`.

Como tudo passa pela mesma origem (`http://localhost`), CORS deixa de ser problema em produção - o navegador nunca faz requisição cross-origin para o backend.

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
- **Docker Compose com proxy reverso** unindo banco, API, SPA e proxy em uma única rede interna; só o proxy expõe porta ao host, eliminando CORS em produção e simulando um deploy real.

## Diferenciais e itens bônus implementados

Itens além dos requisitos funcionais básicos do case. Cada um está descrito aqui ou demonstrado no vídeo de apresentação (link no topo do README após gravação).

### Observabilidade
- **Logger estruturado Pino** com o formato exato sugerido pelo case: `AI Request: Title="...", Discipline="...", TokenUsage=180, Latency=1.4s`.
- **Endpoint `/health`** que valida não só o processo Node mas também a conexão com o Postgres (`dependencies.database: up`).
- **Request logger middleware** em todas as requisições (latência, status, método, rota).

### DevOps
- **CI no GitHub Actions** (`.github/workflows/lint.yml`) com matrix paralelo (backend e frontend independentes, `fail-fast: false`), cache do npm baseado em `package-lock.json`, ESLint + Prettier em modo verificação.
- **Containerização completa**: 4 serviços (`db`, `backend`, `frontend`, `proxy`), só o proxy expõe porta ao host, CORS eliminado em produção. Subir com `docker compose up --build`.
- **Build multi-stage do frontend**: stage Node compila o SPA, stage Nginx alpine serve só o `dist` final. Imagem de produção sem Node nem `node_modules`.
- **Healthcheck no Postgres** com `depends_on: condition: service_healthy` no backend, evitando race condition na subida.
- **Migration automática no init do banco** via mount em `/docker-entrypoint-initdb.d`.

### Backend
- **Arquitetura em camadas** (controller/service/repository) com responsabilidades isoladas: controller só conhece HTTP, service só conhece regras de negócio, repository só conhece SQL.
- **Testes de integração com mock só do repositório** - cada camada testada isoladamente sem precisar de banco real.
- **Validação centralizada via middleware Zod** aplicado nas rotas antes do controller, rejeitando dados inválidos antes de qualquer regra de negócio.
- **Conversão snake_case ↔ camelCase** centralizada no repository, isolando a app das convenções do PostgreSQL.

### Frontend
- **TagInput customizado** com chips, remoção por X, Enter/vírgula para adicionar, Backspace remove o último - feito do zero, sem biblioteca.
- **useDebouncedValue (400ms)** na busca textual da listagem para evitar uma requisição por tecla pressionada.
- **TanStack Query com `placeholderData`** mantém os dados anteriores enquanto paginamos, evitando flicker entre páginas.
- **`useWatch` ao invés de `watch`** do react-hook-form para ficar compatível com o React Compiler.
- **try_files no nginx do frontend** para rotas client-side do React Router não darem 404 ao recarregar (ex: `/planos/5/editar` refresh).
- **Smart Assist com merge sem duplicar**: a IA pode rodar várias vezes sem sobrescrever o que o usuário já digitou (usa `Set` para deduplicar).

### Processo
- **Histórico de Git limpo**: 7 PRs sequenciais, cada um com commits pequenos e prefixos consistentes (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`).
- **`.gitattributes` forçando eol=lf** resolveu problemas de CRLF do Windows com Prettier.
- **Setup dev local separado** (`dev_setup_local.md`) para iteração rápida sem rebuildar containers a cada mudança.
