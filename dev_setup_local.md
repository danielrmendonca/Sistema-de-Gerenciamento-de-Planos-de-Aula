# Modo de desenvolvimento local (HMR)

Setup alternativo ao Docker Compose (documentado no [README.md](./README.md)) para quem está iterando código. O backend recarrega ao salvar (nodemon) e o frontend tem hot reload do Vite, evitando o custo de rebuildar imagens Docker a cada mudança.

## Pré-requisitos
- Node.js 20+ e npm 10+.
- Docker (apenas para subir o Postgres standalone abaixo).
- API Key do Google AI Studio em `backend/.env` (igual ao modo padrão).

## 1. Instalar dependências
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 2. Subir um Postgres standalone na porta 5432 do host
Container separado, não confundir com o serviço `db` do `docker-compose.yml` (que não expõe porta ao host).

```bash
docker run -d \
  --name lesson-plans-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lesson_plans \
  -p 5432:5432 \
  postgres:15-alpine
```

Rode a migration uma vez (Linux/Mac):
```bash
docker exec lesson-plans-db psql -U postgres -d lesson_plans \
  -f /dev/stdin < backend/src/db/migrations/001_create_lesson_plans.sql
```

No Windows (PowerShell):
```powershell
Get-Content backend\src\db\migrations\001_create_lesson_plans.sql |
  docker exec -i lesson-plans-db psql -U postgres -d lesson_plans
```

## 3. Iniciar backend e frontend em terminais separados
```bash
# Terminal 1 - backend em http://localhost:3000
cd backend && npm run dev

# Terminal 2 - frontend em http://localhost:5173 (com proxy /api -> :3000)
cd frontend && npm run dev
```

Acesse http://localhost:5173/.

## Sessões seguintes
O container do banco persiste os dados. Para reabrir o modo dev em sessões futuras:
```bash
docker start lesson-plans-db
cd backend && npm run dev      # em um terminal
cd frontend && npm run dev     # em outro terminal
```

## Importante: não rode os dois modos ao mesmo tempo
O modo dev usa o container `lesson-plans-db` (porta 5432 do host); o modo Docker Compose usa o serviço `db` interno (sem porta exposta) e o proxy ocupa a porta 80. Eles não colidem em portas, mas mantêm dois Postgres rodando simultaneamente sem necessidade. Pare o que não estiver usando:
```bash
docker stop lesson-plans-db    # ao alternar para o modo Compose
docker compose stop            # ao alternar para o modo dev
```
