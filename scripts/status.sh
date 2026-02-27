#!/usr/bin/env bash
set -euo pipefail
cd /opt/automacoes_c2tech
export COMPOSE_PROJECT_NAME="automacoes_c2tech"
docker compose ps
docker compose logs --tail=120
