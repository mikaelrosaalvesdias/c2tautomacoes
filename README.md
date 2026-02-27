# Painel Visual MVP - automacoes_c2tech

Painel web mínimo em Next.js para leitura de dados do NocoDB (server-side), com autenticação simples por usuário/senha e deploy via Docker Compose com porta livre automática.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind + componentes estilo shadcn/ui
- Docker (multi-stage + standalone)

## Variáveis de ambiente

Crie `.env` a partir de `.env.example`:

```env
NOCODB_BASE_URL=https://SEU_DOMINIO_DO_NOCODB
NOCODB_XC_TOKEN=SEU_TOKEN
NOCODB_BASE_ID=progyvc3s50mh2d
NOCODB_DATA_PATH_PREFIX=
PORT=
APP_ADMIN_USER=admin
APP_ADMIN_PASS=troque_isto
SESSION_SECRET=
```

- `NOCODB_XC_TOKEN` nunca vai para o browser.
- Todas as chamadas ao NocoDB ocorrem no server (`lib/nocodb.ts` e Route Handlers).

## Endpoints API

- `GET /api/health`
- `GET /api/inbox?limit=50`
- `GET /api/inbox/[id]`
- `GET /api/acoes?limit=50`
- `GET /api/acoes/[id]`
- `GET /api/cancelamentos?limit=50`
- `GET /api/emails?limit=50`
- `GET /api/emails/[id]`

## Páginas

- `/login`
- `/`
- `/inbox`
- `/inbox/[id]`
- `/acoes`
- `/acoes/[id]`
- `/cancelamentos`
- `/emails`
- `/emails/[id]`

## Deploy

```bash
cd /opt/automacoes_c2tech
chmod +x scripts/*.sh
bash scripts/deploy.sh
```

O deploy:

- cria `.env` automaticamente se não existir;
- seleciona primeira porta livre no range `3010..3099`;
- atualiza `PORT=` no `.env`;
- sobe o container com `COMPOSE_PROJECT_NAME=automacoes_c2tech`;
- valida `http://127.0.0.1:$PORT/api/health`.

## Status

```bash
bash scripts/status.sh
```

## Autenticação MVP

- Usuário/senha via `APP_ADMIN_USER` e `APP_ADMIN_PASS`
- Cookie HTTP-only com assinatura HMAC
- Páginas protegidas para usuários autenticados
