#!/usr/bin/env bash
# setup_nocodb_tables.sh — Creates required NocoDB tables for RBAC/security features
#
# Usage:
#   cd /opt/automacoes_c2tech
#   source .env
#   bash scripts/setup_nocodb_tables.sh
#
# Tables created:
#   - usuarios
#   - user_access
#   - sessions
#   - audit_logs
#
set -euo pipefail

: "${NOCODB_BASE_URL:?NOCODB_BASE_URL obrigatório}"
: "${NOCODB_XC_TOKEN:?NOCODB_XC_TOKEN obrigatório}"
: "${NOCODB_BASE_ID:?NOCODB_BASE_ID obrigatório}"

NOCO="${NOCODB_BASE_URL%/}"
BASE_ID="$NOCODB_BASE_ID"
TOKEN="$NOCODB_XC_TOKEN"
TABLES_URL="${NOCO}/api/v2/meta/bases/${BASE_ID}/tables"

echo "════════════════════════════════════════"
echo " NocoDB Table Setup — C2Tech Automações"
echo " Base: ${BASE_ID}"
echo "════════════════════════════════════════"

noco_post() {
  local url="$1"
  local data="$2"
  curl -sS -X POST "$url" \
    -H "xc-token: ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$data"
}

get_table_id() {
  local title="$1"
  curl -sS "${TABLES_URL}" -H "xc-token: ${TOKEN}" | \
    python3 -c "
import sys, json
data = json.load(sys.stdin)
tables = data.get('list', [])
for t in tables:
    if t.get('title') == sys.argv[1]:
        print(t.get('id', ''))
        break
" "$title" 2>/dev/null || true
}

table_exists() {
  local title="$1"
  local tid
  tid="$(get_table_id "$title")"
  [ -n "$tid" ]
}

create_table_if_missing() {
  local title="$1"
  local data="$2"
  if table_exists "$title"; then
    echo "[SKIP] Tabela '${title}' já existe"
  else
    echo "[CREATE] Criando tabela '${title}'..."
    result="$(noco_post "$TABLES_URL" "$data")"
    if echo "$result" | grep -q '"id"'; then
      echo "[OK] Tabela '${title}' criada"
    else
      echo "[WARN] Resposta inesperada para '${title}': $(echo "$result" | head -c 200)"
    fi
  fi
}

# ── 1) usuarios ───────────────────────────────────────────────────────────────
create_table_if_missing "usuarios" '{
  "title": "usuarios",
  "columns": [
    { "column_name": "email",                 "uidt": "Email",          "title": "email" },
    { "column_name": "nome",                  "uidt": "SingleLineText", "title": "nome" },
    { "column_name": "password_hash",         "uidt": "LongText",       "title": "password_hash" },
    { "column_name": "status",                "uidt": "Checkbox",       "title": "status" },
    { "column_name": "role",                  "uidt": "SingleSelect",   "title": "role",
      "colOptions": { "options": [
        { "title": "admin",   "color": "#F06"},
        { "title": "manager", "color": "#FA0"},
        { "title": "viewer",  "color": "#0A0"}
      ]}
    },
    { "column_name": "force_password_reset",  "uidt": "Checkbox",       "title": "force_password_reset" }
  ]
}'

# ── 2) user_access ────────────────────────────────────────────────────────────
create_table_if_missing "user_access" '{
  "title": "user_access",
  "columns": [
    { "column_name": "user_id",                "uidt": "Number",         "title": "user_id" },
    { "column_name": "empresa",                "uidt": "SingleSelect",   "title": "empresa",
      "colOptions": { "options": [
        { "title": "inka",         "color": "#0A0"},
        { "title": "californiatv", "color": "#00A"}
      ]}
    },
    { "column_name": "can_view_dashboard",     "uidt": "Checkbox",       "title": "can_view_dashboard" },
    { "column_name": "can_view_inbox",         "uidt": "Checkbox",       "title": "can_view_inbox" },
    { "column_name": "can_view_acoes",         "uidt": "Checkbox",       "title": "can_view_acoes" },
    { "column_name": "can_view_cancelamentos", "uidt": "Checkbox",       "title": "can_view_cancelamentos" },
    { "column_name": "can_view_emails",        "uidt": "Checkbox",       "title": "can_view_emails" },
    { "column_name": "can_edit_inbox",         "uidt": "Checkbox",       "title": "can_edit_inbox" },
    { "column_name": "can_edit_acoes",         "uidt": "Checkbox",       "title": "can_edit_acoes" },
    { "column_name": "can_manage_users",       "uidt": "Checkbox",       "title": "can_manage_users" }
  ]
}'

# ── 3) sessions ───────────────────────────────────────────────────────────────
create_table_if_missing "sessions" '{
  "title": "sessions",
  "columns": [
    { "column_name": "session_id",   "uidt": "SingleLineText", "title": "session_id" },
    { "column_name": "user_id",      "uidt": "Number",         "title": "user_id" },
    { "column_name": "expires_at",   "uidt": "DateTime",       "title": "expires_at" },
    { "column_name": "last_seen_at", "uidt": "DateTime",       "title": "last_seen_at" },
    { "column_name": "ip",           "uidt": "SingleLineText", "title": "ip" },
    { "column_name": "user_agent",   "uidt": "SingleLineText", "title": "user_agent" }
  ]
}'

# ── 4) audit_logs ─────────────────────────────────────────────────────────────
create_table_if_missing "audit_logs" '{
  "title": "audit_logs",
  "columns": [
    { "column_name": "user_email",   "uidt": "Email",          "title": "user_email" },
    { "column_name": "action",       "uidt": "SingleLineText", "title": "action" },
    { "column_name": "resource",     "uidt": "SingleLineText", "title": "resource" },
    { "column_name": "resource_id",  "uidt": "SingleLineText", "title": "resource_id" },
    { "column_name": "empresa",      "uidt": "SingleLineText", "title": "empresa" },
    { "column_name": "ip",           "uidt": "SingleLineText", "title": "ip" },
    { "column_name": "user_agent",   "uidt": "SingleLineText", "title": "user_agent" }
  ]
}'

echo ""
echo "════════════════════════════════════════"
echo " Setup concluído."
echo ""
echo " Próximos passos:"
echo " 1. Crie o primeiro usuário admin via API ou diretamente no NocoDB"
echo "    (senha deve ser hash bcrypt — use scripts/create_admin_user.sh)"
echo " 2. Configure ENABLE_BREAK_GLASS=true temporariamente se necessário"
echo " 3. Rode o smoke test: bash scripts/smoke_test.sh"
echo "════════════════════════════════════════"
