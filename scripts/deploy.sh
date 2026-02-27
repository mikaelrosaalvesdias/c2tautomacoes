#!/usr/bin/env bash
set -euo pipefail

ROOT="/opt/automacoes_c2tech"
cd "$ROOT"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Criei .env a partir de .env.example. Preencha NOCODB_BASE_URL e NOCODB_XC_TOKEN antes do deploy." >&2
fi

is_listening() {
  local p="$1"
  ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${p}$"
}

CURRENT_PORT="$(grep -E '^PORT=' .env | tail -n1 | cut -d'=' -f2- | tr -d '[:space:]' || true)"

if [[ -n "${CURRENT_PORT}" && "${CURRENT_PORT}" =~ ^[0-9]+$ ]]; then
  if is_listening "${CURRENT_PORT}"; then
    PORT="$(bash scripts/find_free_port.sh 3010 3099)"
  else
    PORT="${CURRENT_PORT}"
  fi
else
  PORT="$(bash scripts/find_free_port.sh 3010 3099)"
fi

# Atualiza ou adiciona PORT= no .env
if grep -qE '^PORT=' .env; then
  sed -i "s/^PORT=.*/PORT=${PORT}/" .env
else
  echo "PORT=${PORT}" >> .env
fi

export COMPOSE_PROJECT_NAME="automacoes_c2tech"
docker compose up -d --build

echo "Rodando em: http://127.0.0.1:${PORT}"
for attempt in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    echo "OK"
    exit 0
  fi
  sleep 1
done

echo "Healthcheck falhou" >&2
exit 1
