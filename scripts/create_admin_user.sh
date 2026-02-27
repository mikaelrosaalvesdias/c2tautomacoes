#!/usr/bin/env bash
# create_admin_user.sh — Creates the first admin user via the running app API
#
# Requires ENABLE_BREAK_GLASS=true and APP_ADMIN_USER/APP_ADMIN_PASS to be set.
#
# Usage:
#   ADMIN_EMAIL=admin@empresa.com ADMIN_NOME="Admin" ADMIN_PASS="SenhaForte123" \
#   bash scripts/create_admin_user.sh
#
set -euo pipefail

ROOT="/opt/automacoes_c2tech"
cd "$ROOT"

if [ -f ".env" ]; then
  set -a; source .env; set +a
fi

PORT="${PORT:-3010}"
BASE_URL="http://127.0.0.1:${PORT}"

# Admin credentials (from env or prompt)
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_NOME="${ADMIN_NOME:-}"
ADMIN_PASS="${ADMIN_PASS:-}"
BG_USER="${APP_ADMIN_USER:-}"
BG_PASS="${APP_ADMIN_PASS:-}"

if [ -z "$ADMIN_EMAIL" ]; then
  read -rp "Email do novo admin: " ADMIN_EMAIL
fi
if [ -z "$ADMIN_NOME" ]; then
  read -rp "Nome do novo admin: " ADMIN_NOME
fi
if [ -z "$ADMIN_PASS" ]; then
  read -srp "Senha do novo admin (min 8 chars): " ADMIN_PASS
  echo
fi
if [ -z "$BG_USER" ]; then
  read -rp "Email break-glass (APP_ADMIN_USER): " BG_USER
fi
if [ -z "$BG_PASS" ]; then
  read -srp "Senha break-glass (APP_ADMIN_PASS): " BG_PASS
  echo
fi

COOKIE_FILE="/tmp/c2tech_create_admin.cookies"
RESP_FILE="/tmp/c2tech_create_resp.json"
rm -f "$COOKIE_FILE" "$RESP_FILE"

echo "[INFO] Fazendo login break-glass..."
login_status="$(
  curl -sS -o "$RESP_FILE" -w '%{http_code}' \
    -c "$COOKIE_FILE" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"${BG_USER}\",\"password\":\"${BG_PASS}\"}" \
    "${BASE_URL}/api/auth/login"
)"

if [ "$login_status" != "200" ]; then
  echo "[FAIL] Login break-glass falhou (HTTP $login_status)" >&2
  cat "$RESP_FILE" >&2
  exit 1
fi
echo "[OK] Login break-glass"

echo "[INFO] Criando usuário admin: ${ADMIN_EMAIL}..."
create_status="$(
  curl -sS -o "$RESP_FILE" -w '%{http_code}' \
    -b "$COOKIE_FILE" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"nome\":\"${ADMIN_NOME}\",\"password\":\"${ADMIN_PASS}\",\"role\":\"admin\",\"status\":true}" \
    "${BASE_URL}/api/admin/users"
)"

if [ "$create_status" = "201" ]; then
  echo "[OK] Usuário admin criado com sucesso!"
  cat "$RESP_FILE"
else
  echo "[FAIL] Falha ao criar usuário (HTTP $create_status)" >&2
  cat "$RESP_FILE" >&2
  exit 1
fi

# Set access for all empresas
USER_ID="$(python3 -c "import sys,json; d=json.load(open('${RESP_FILE}')); print(d.get('user',{}).get('Id',''))" 2>/dev/null || true)"
if [ -n "$USER_ID" ]; then
  echo "[INFO] Configurando permissões para o novo admin..."
  access_status="$(
    curl -sS -o /dev/null -w '%{http_code}' \
      -b "$COOKIE_FILE" \
      -H 'Content-Type: application/json' \
      -d '[
        {"empresa":"inka","can_view_dashboard":true,"can_view_inbox":true,"can_view_acoes":true,"can_view_cancelamentos":true,"can_view_emails":true,"can_edit_inbox":true,"can_edit_acoes":true,"can_manage_users":true},
        {"empresa":"californiatv","can_view_dashboard":true,"can_view_inbox":true,"can_view_acoes":true,"can_view_cancelamentos":true,"can_view_emails":true,"can_edit_inbox":true,"can_edit_acoes":true,"can_manage_users":true}
      ]' \
      "${BASE_URL}/api/admin/users/${USER_ID}/access"
  )"
  [ "$access_status" = "200" ] && echo "[OK] Permissões configuradas" || echo "[WARN] Permissões: HTTP $access_status"
fi

echo "[INFO] Fazendo logout..."
curl -sS -o /dev/null -b "$COOKIE_FILE" -X POST "${BASE_URL}/api/auth/logout"
rm -f "$COOKIE_FILE" "$RESP_FILE"

echo ""
echo "════════════════════════════════════════"
echo " Admin criado: ${ADMIN_EMAIL}"
echo " Desabilite ENABLE_BREAK_GLASS após criar todos os usuários necessários."
echo "════════════════════════════════════════"
