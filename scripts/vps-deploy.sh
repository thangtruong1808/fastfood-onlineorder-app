#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env in $ROOT"
  echo "Run: cp .env_sample_vps .env"
  exit 1
fi

BRANCH="${DEPLOY_BRANCH:-main}"

git fetch origin "$BRANCH"
git checkout -f -B "$BRANCH" "origin/$BRANCH"

docker compose up -d --build --remove-orphans
docker image prune -f

echo "Deployed $BRANCH. Site port is set by APP_PORT in .env (default 8080)."
