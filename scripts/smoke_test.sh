#!/usr/bin/env bash
set -euo pipefail

ROOT="/opt/automacoes_c2tech"
cd "$ROOT"

if [ ! -f ".env" ]; then
  echo "Arquivo .env não encontrado em $ROOT" >&2
  exit 1
fi

set -a
source .env
set +a

PORT="${PORT:-3011}"
BASE_URL="http://127.0.0.1:${PORT}"
COOKIE_FILE="/tmp/c2tech.cookies"
LOGIN_BODY_FILE="/tmp/c2tech_login_body.json"
RESP_FILE="/tmp/c2tech_smoke_resp.json"

rm -f "$COOKIE_FILE" "$LOGIN_BODY_FILE" "$RESP_FILE"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

echo "[INFO] Smoke test em ${BASE_URL}"

health_body="$(curl -fsS "${BASE_URL}/api/health")" || fail "Healthcheck indisponível"
echo "$health_body" | grep -q '"ok"[[:space:]]*:[[:space:]]*true' || fail "Healthcheck inválido: ${health_body}"
echo "[OK] /api/health"

LOGIN_USER="${APP_ADMIN_USER:-admin}"
LOGIN_PASS="${APP_ADMIN_PASS:-Master5562@}"

cat > "$LOGIN_BODY_FILE" <<EOF
{"username":"$(json_escape "$LOGIN_USER")","password":"$(json_escape "$LOGIN_PASS")"}
EOF

login_status="$(
  curl -sS -o "$RESP_FILE" -w '%{http_code}' \
    -c "$COOKIE_FILE" \
    -H 'Content-Type: application/json' \
    --data-binary "@${LOGIN_BODY_FILE}" \
    "${BASE_URL}/api/auth/login"
)"

if [ "$login_status" != "200" ]; then
  short_body="$(head -c 240 "$RESP_FILE" 2>/dev/null || true)"
  fail "Login falhou (HTTP ${login_status}). Resumo: ${short_body}"
fi
echo "[OK] /api/auth/login"

ENDPOINTS=(
  "/api/inbox?limit=5"
  "/api/acoes?limit=5"
  "/api/cancelamentos?limit=5"
  "/api/emails?limit=5"
)

if [ -n "${NOCODB_BASE_URL:-}" ] && [ -n "${NOCODB_XC_TOKEN:-}" ] && [ -n "${NOCODB_BASE_ID:-}" ]; then
  nocodb_status="$(
    curl -sS -o "$RESP_FILE" -w '%{http_code}' \
      -H "xc-token: ${NOCODB_XC_TOKEN}" \
      "${NOCODB_BASE_URL%/}/api/v1/db/data/v1/${NOCODB_BASE_ID}/chegada_suporte?limit=1" || true
  )"
  if [[ "$nocodb_status" =~ ^[0-9]{3}$ ]]; then
    echo "[INFO] NocoDB direct check status: ${nocodb_status}"
  else
    echo "[WARN] NocoDB direct check sem resposta"
  fi
else
  echo "[WARN] NocoDB direct check ignorado (variáveis ausentes)."
fi

for endpoint in "${ENDPOINTS[@]}"; do
  status="$(
    curl -sS -o "$RESP_FILE" -w '%{http_code}' \
      -b "$COOKIE_FILE" \
      "${BASE_URL}${endpoint}"
  )"

  if [ "$status" = "401" ]; then
    fail "${endpoint} retornou 401 (cookie/sessão inválida)"
  fi

  if [[ "$status" =~ ^5[0-9][0-9]$ ]]; then
    short_body="$(head -c 240 "$RESP_FILE" 2>/dev/null || true)"
    fail "${endpoint} retornou ${status}. Resumo: ${short_body}"
  fi

  if [[ ! "$status" =~ ^2[0-9][0-9]$ ]]; then
    short_body="$(head -c 240 "$RESP_FILE" 2>/dev/null || true)"
    fail "${endpoint} retornou ${status}. Resumo: ${short_body}"
  fi

  echo "[OK] ${endpoint}"
done

echo "[OK] Smoke test finalizado"
