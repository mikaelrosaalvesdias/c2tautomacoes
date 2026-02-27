# Segurança — C2Tech Automações

## Visão geral

Este documento descreve as práticas de segurança implementadas no projeto.

---

## Autenticação

- **Multi-usuário**: login por email + senha (bcrypt, cost factor 12)
- **Sessões**: token HMAC-SHA256 assinado com `SESSION_SECRET` (12 horas)
- **Cookie**: `HttpOnly`, `SameSite=Lax`, `Secure` em produção (auto-detectado ou `COOKIE_SECURE=true`)
- **Break-glass**: `APP_ADMIN_USER/PASS` disponível apenas quando `ENABLE_BREAK_GLASS=true`
- **Rate limit**: 10 tentativas / 10 min por IP + email em `/api/auth/login`

## Autorização (RBAC)

| Papel     | Capacidades                                      |
|-----------|--------------------------------------------------|
| `admin`   | Acesso total + gerenciar usuários                |
| `manager` | Acesso conforme permissões da tabela user_access |
| `viewer`  | Somente leitura conforme user_access             |

Cada usuário tem permissões por empresa (inka / californiatv) e por recurso
(dashboard, inbox, acoes, cancelamentos, emails).

**Regra de ouro**: o servidor SEMPRE valida sessão + permissões.
Nunca confiar no front-end.

---

## Segredos e variáveis de ambiente

| Variável              | Descrição                         | Exposto ao cliente? |
|-----------------------|-----------------------------------|---------------------|
| `NOCODB_XC_TOKEN`     | Token de API do NocoDB            | ❌ Nunca            |
| `SESSION_SECRET`      | Chave HMAC para sessões           | ❌ Nunca            |
| `APP_ADMIN_PASS`      | Senha break-glass                 | ❌ Nunca            |
| `ENABLE_BREAK_GLASS`  | Habilita login de emergência      | ❌ Nunca            |

Regras:
- Nunca usar prefixo `NEXT_PUBLIC_` para segredos
- Nunca logar valores de segredos
- `.env` está no `.gitignore`
- `.env.example` só com placeholders

---

## Headers HTTP de segurança

Adicionados pelo `middleware.ts` em toda resposta:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Content-Security-Policy: frame-ancestors 'none'; default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Tratamento de erros

- Erros internos nunca expõem stack traces ao cliente
- Respostas genéricas: 400/401/403/404/500
- Logs com redação automática de campos sensíveis via `lib/logger.ts`

---

## Validação de entradas (Zod)

- Todas as entradas de API validadas com esquemas Zod em `lib/validate.ts`
- Limites: email ≤ 254 chars, nome ≤ 120 chars, limit paginação 1–200
- IDs de parâmetros validados antes de consultas ao banco

---

## Proteção contra ataques

| Ameaça         | Mitigação                                           |
|----------------|-----------------------------------------------------|
| Brute force    | Rate limit por IP + email (in-memory, 10/10min)     |
| XSS            | Sem `dangerouslySetInnerHTML` para conteúdo externo |
| CSRF           | Cookie HttpOnly + SameSite=Lax                      |
| Clickjacking   | `X-Frame-Options: DENY`                             |
| Timing attack  | `crypto.timingSafeEqual` na verificação de token    |
| Exposição de empresa | RBAC verifica empresa do registro, não só sessão |

---

## Logs de auditoria

Eventos registrados na tabela `audit_logs` do NocoDB:
- `login_success` / `login_fail` / `login_success_breakglass`
- `logout`
- `create_user` / `update_user` / `reset_password`
- `update_user_access`

Logs **nunca** incluem: senha, token, cookie, SESSION_SECRET, NOCODB_XC_TOKEN, conteúdo de email.

---

## Tabelas NocoDB para segurança

| Tabela       | Finalidade                                        |
|--------------|---------------------------------------------------|
| `usuarios`   | Cadastro com hash bcrypt da senha                  |
| `user_access`| Permissões granulares por empresa e recurso        |
| `sessions`   | Sessões para auditoria e revogação futura          |
| `audit_logs` | Histórico de ações de segurança                   |

---

## Rotação de segredos

Se qualquer segredo for vazado:
1. Gerar novo `SESSION_SECRET` (`openssl rand -base64 48`)
2. Atualizar `.env` no servidor
3. Reiniciar container (todas sessões ativas serão invalidadas)
4. Se `NOCODB_XC_TOKEN` vazou: revogar no painel NocoDB e gerar novo

---

## Checklist de deployment

- [ ] `SESSION_SECRET` definido com valor forte (≥ 32 chars)
- [ ] `COOKIE_SECURE=true` em produção com HTTPS
- [ ] `ENABLE_BREAK_GLASS` não definido ou `=false` em produção normal
- [ ] `.env` NÃO versionado no git
- [ ] Imagem Docker sem segredos embutidos (ARG/ENV no Dockerfile sem valores fixos)
- [ ] Logs verificados — sem valores de segredos aparecendo
- [ ] npm audit sem vulnerabilidades críticas

---

## Vazamento e resposta

- Se segredo vazar: rotacionar imediatamente
- Revisar histórico Git e remover o segredo da árvore se necessário
- Comunicar o incidente ao responsável técnico da C2Tech

## Revisão de PR

- Verificar paths alterados por responsabilidade de branch (ver UI_RULES.md)
- Bloquear PR com segredo hardcoded
- Confirmar `npm run build` e deploy após merge
