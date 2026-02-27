# UI Rules (Branch Contract)

Este projeto separa responsabilidades entre UI (Manus) e backend/lógica (Codex).

## Branches

- `ui/manus`: mudanças visuais e UX
- `backend/codex`: lógica, segurança, dados, integrações

## A branch `ui/manus` pode alterar apenas

- `app/**` (exceto `app/api/**`)
- `components/**`
- `styles/**`
- `public/**`
- `components/ui/**` quando faltar componente visual

## Proibido alterar na branch `ui/manus`

- `app/api/**`
- `lib/auth.ts`
- `lib/nocodb.ts`
- `middleware.ts`
- `scripts/**`
- `Dockerfile`
- `docker-compose.yml`
- `.env*`

## Regras adicionais

- Não introduzir segredos em código ou assets.
- Não quebrar rotas existentes: `/login`, `/`, `/inbox`, `/acoes`, `/cancelamentos`, `/emails`.
- Pull request de `ui/manus -> main` deve descrever apenas mudanças de UI/UX.

## Contrato de revisão

- Mudança fora dos caminhos permitidos deve ser recusada.
- Build e deploy devem continuar funcionando após merge.
