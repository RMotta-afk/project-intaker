#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
IMAGE=project-intaker
CONTAINER=project-intaker
VOLUME=project-intaker-data
PORT=${PROJECT_INTAKER_PORT:-3000}

# Build first so a failed build leaves the current app running.
docker volume create "$VOLUME" >/dev/null
docker build -t "$IMAGE" .

# Keep local provider settings optional and outside the image. Prefer a
# Docker-specific file, then fall back to the app's local .env file.
ENV_FILE_ARGS=
if [ -f .env.container ]; then
  ENV_FILE_ARGS="--env-file .env.container"
elif [ -f .env ]; then
  ENV_FILE_ARGS="--env-file .env"
fi

# An old --rm container disappears on stop; the named SQLite volume remains.
docker stop "$CONTAINER" >/dev/null 2>&1 || true
docker rm "$CONTAINER" >/dev/null 2>&1 || true

# Intentionally split the optional single env-file argument for docker run.
# shellcheck disable=SC2086
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  --init \
  -p "$PORT:3000" \
  --mount "source=$VOLUME,target=/data" \
  -e DATABASE_URL=file:/data/intakes.db \
  $ENV_FILE_ARGS \
  "$IMAGE"
