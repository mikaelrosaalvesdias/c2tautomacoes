#!/usr/bin/env bash
set -euo pipefail

START_PORT="${1:-3010}"
END_PORT="${2:-3099}"

is_listening() {
  local p="$1"
  ss -ltn | awk '{print $4}' | grep -qE "[:.]${p}$"
}

for ((port=START_PORT; port<=END_PORT; port++)); do
  if ! is_listening "$port"; then
    echo "$port"
    exit 0
  fi
done

echo "Nenhuma porta livre entre ${START_PORT}-${END_PORT}" >&2
exit 1
