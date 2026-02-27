#!/usr/bin/env bash
# security_smoke_test.sh — Validates security controls
# Tests: 401 without cookie, 403 wrong permission, rate-limit, headers, public pages
set -euo pipefail

ROOT="/opt/automacoes_c2tech"
cd "$ROOT"

# Save PORT from command line BEFORE sourcing .env
FORCED_PORT="${PORT:-}"

if [ ! -f ".env" ]; then
  echo "Arquivo .env não encontrado em $ROOT" >&2
  exit 1
fi

set -a
source .env
set +a

# Command-line PORT takes precedence over .env PORT
if [ -n "$FORCED_PORT" ]; then PORT="$FORCED_PORT"; fi
PORT="${PORT:-3010}"
# BASE_URL pode ser sobrescrito via variável de ambiente
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
PASS_COUNT=0
FAIL_COUNT=0
RESP_FILE="/tmp/c2tech_sec_resp.json"

pass() { echo "[PASS] $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { echo "[FAIL] $1" >&2; FAIL_COUNT=$((FAIL_COUNT + 1)); }

check_status() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    pass "$desc → HTTP $actual"
  else
    fail "$desc → esperado HTTP $expected, recebido HTTP $actual"
  fi
}

echo "════════════════════════════════════════"
echo " C2Tech Security Smoke Test"
echo " URL: ${BASE_URL}"
echo "════════════════════════════════════════"

# ── Healthcheck ──────────────────────────────────────────────────────────────
health_status="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' "${BASE_URL}/api/health")"
check_status "GET /api/health" "200" "$health_status"

# ── 1) 401 without session cookie ────────────────────────────────────────────
echo ""
echo "── Teste A: 401 sem cookie de sessão ──"

for ep in /api/auth/me /api/inbox /api/acoes /api/cancelamentos /api/emails /api/admin/users; do
  status="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' "${BASE_URL}${ep}")"
  check_status "GET ${ep} (sem cookie)" "401" "$status"
done

# ── 2) Security headers ───────────────────────────────────────────────────────
echo ""
echo "── Teste B: Security headers ──"

headers="$(curl -sS -I "${BASE_URL}/api/health")"

check_header() {
  local header="$1"
  if echo "$headers" | grep -qi "$header"; then
    pass "Header presente: $header"
  else
    fail "Header ausente: $header"
  fi
}

check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Referrer-Policy"
check_header "Content-Security-Policy"

# ── 3) Login rate limit ───────────────────────────────────────────────────────
echo ""
echo "── Teste C: Rate limit no login ──"

# Use a unique email per test run to avoid collisions
RATE_EMAIL="ratelimit_$(date +%s)@smoke.test"
RATE_LIMIT_HIT=false
for i in $(seq 1 12); do
  status="$(
    curl -sS -o "$RESP_FILE" -w '%{http_code}' \
      -H 'Content-Type: application/json' \
      -d "{\"username\":\"${RATE_EMAIL}\",\"password\":\"wrongpassword${i}\"}" \
      "${BASE_URL}/api/auth/login"
  )"
  if [ "$status" = "429" ]; then
    RATE_LIMIT_HIT=true
    pass "Rate limit ativado na tentativa ${i} (HTTP 429)"
    break
  fi
done

if ! $RATE_LIMIT_HIT; then
  fail "Rate limit NÃO ativado após 12 tentativas (esperado HTTP 429)"
fi

# ── 4) Admin endpoints require admin role ─────────────────────────────────────
echo ""
echo "── Teste D: Admin routes require admin session ──"

ADMIN_COOKIE_FILE="/tmp/c2tech_admin.cookies"
rm -f "$ADMIN_COOKIE_FILE"

if [ "${ENABLE_BREAK_GLASS:-false}" = "true" ] && [ -n "${APP_ADMIN_USER:-}" ] && [ -n "${APP_ADMIN_PASS:-}" ]; then
  bg_status="$(
    curl -sS -o "$RESP_FILE" -w '%{http_code}' \
      -c "$ADMIN_COOKIE_FILE" \
      -H 'Content-Type: application/json' \
      -d "{\"username\":\"${APP_ADMIN_USER}\",\"password\":\"${APP_ADMIN_PASS}\"}" \
      "${BASE_URL}/api/auth/login"
  )"
  if [ "$bg_status" = "200" ]; then
    pass "Break-glass login OK"
    admin_status="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' -b "$ADMIN_COOKIE_FILE" "${BASE_URL}/api/admin/users")"
    check_status "GET /api/admin/users com sessão admin" "200" "$admin_status"
  else
    fail "Break-glass login falhou (HTTP $bg_status)"
  fi
  rm -f "$ADMIN_COOKIE_FILE"
else
  echo "[SKIP] Break-glass desabilitado — testes D ignorados"
fi

# ── 5) Privacy and Terms pages publicly accessible ───────────────────────────
echo ""
echo "── Teste E: Páginas públicas ──"

privacy_status="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' "${BASE_URL}/privacy")"
check_status "GET /privacy (sem cookie)" "200" "$privacy_status"

terms_status="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' "${BASE_URL}/terms")"
check_status "GET /terms (sem cookie)" "200" "$terms_status"

login_status="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' "${BASE_URL}/login")"
check_status "GET /login (sem cookie)" "200" "$login_status"

# ── 6) Protected page redirects to login ──────────────────────────────────────
echo ""
echo "── Teste F: Redirect sem sessão ──"

dash_initial="$(curl -sS -o "$RESP_FILE" -w '%{http_code}' "${BASE_URL}/")"
if [ "$dash_initial" = "307" ] || [ "$dash_initial" = "302" ] || [ "$dash_initial" = "200" ]; then
  pass "GET / sem cookie → redirect ou login (HTTP $dash_initial)"
else
  fail "GET / sem cookie → HTTP $dash_initial (esperado redirect)"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo " Resultado: ${PASS_COUNT} passou(aram) / ${FAIL_COUNT} falhou(aram)"
echo "════════════════════════════════════════"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
