#!/usr/bin/env bash
set -euo pipefail
set -o errtrace

trap 'exit_code=$?; echo "==> ERROR: deploy failed (exit ${exit_code}) at ${BASH_SOURCE[0]}:${LINENO}: ${BASH_COMMAND}" >&2' ERR

IMAGE_TAG="${1:-}"
REPOSITORY_OWNER="${2:-}"

if [ -z "${IMAGE_TAG}" ] || [ -z "${REPOSITORY_OWNER}" ]; then
  echo "Usage: $0 <IMAGE_TAG> <REPOSITORY_OWNER>"
  exit 1
fi

export IMAGE_TAG
export REPOSITORY_OWNER

echo "==> Pull images defined in docker-compose.prod.yml"
docker compose -f docker-compose.prod.yml pull

echo "==> Ensure infra is up (postgres, rabbitmq, clickhouse)"
docker compose -f docker-compose.prod.yml up -d postgres rabbitmq clickhouse

wait_healthy() {
  local name="$1"
  local attempts="${2:-60}"
  local delay="${3:-5}"
  for i in $(seq 1 "${attempts}"); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "${name}" 2>/dev/null || true)"
    if [ "${status}" = "healthy" ]; then
      echo "==> ${name} is healthy"
      return 0
    fi
    running="$(docker inspect -f '{{.State.Running}}' "${name}" 2>/dev/null || true)"
    if [ "${running}" != "true" ]; then
      echo "==> ${name} is not running"
    fi
    echo "==> Waiting for ${name} to become healthy (${i}/${attempts})"
    sleep "${delay}"
  done
  echo "==> ${name} did not become healthy in time"
  docker logs --tail 200 "${name}" || true
  return 1
}

wait_healthy postgres
wait_healthy rabbitmq
wait_healthy clickhouse

# db push (не migrate deploy): в репо нет migrations-папки. Аддитивные nullable-поля
# безопасны; без --accept-data-loss db push падает на разрушающих изменениях, а не теряет данные.
echo "==> Sync Prisma schema to DB (db push)"
docker compose -f docker-compose.prod.yml run --rm server \
  pnpm --filter @lemnity/database exec prisma db push --skip-generate

echo "==> Start / update full stack (server + nginx + infra) with recreate"
docker compose -f docker-compose.prod.yml up -d --force-recreate --remove-orphans

echo "==> Run MinIO setup profile (creates buckets/users)"
docker compose -f docker-compose.prod.yml --profile setup run --rm minio_setup

echo "==> Cleanup old versions of server and collector images"
# Получаем ID текущего образа сервера и удаляем все остальные(устаревшие)
CURRENT_SERVER_ID=$(docker images -q ghcr.io/${REPOSITORY_OWNER}/server:${IMAGE_TAG})
if [ -n "${CURRENT_SERVER_ID}" ]; then
  docker images ghcr.io/${REPOSITORY_OWNER}/server --format "{{.ID}}" | grep -v "${CURRENT_SERVER_ID}" | xargs -r docker rmi -f || true
fi
# Получаем ID текущего образа коллектора и удаляем все остальные(устаревшие)
CURRENT_COLLECTOR_ID=$(docker images -q ghcr.io/${REPOSITORY_OWNER}/collector:${IMAGE_TAG})
if [ -n "${CURRENT_COLLECTOR_ID}" ]; then
  docker images ghcr.io/${REPOSITORY_OWNER}/collector --format "{{.ID}}" | grep -v "${CURRENT_COLLECTOR_ID}" | xargs -r docker rmi -f || true
fi
# Получаем ID текущего образа rabbitmq-gateway и удаляем все остальные(устаревшие)
CURRENT_RABBITMQ_GATEWAY_ID=$(docker images -q ghcr.io/${REPOSITORY_OWNER}/rabbitmq-gateway:${IMAGE_TAG})
if [ -n "${CURRENT_RABBITMQ_GATEWAY_ID}" ]; then
  docker images ghcr.io/${REPOSITORY_OWNER}/rabbitmq-gateway --format "{{.ID}}" | grep -v "${CURRENT_RABBITMQ_GATEWAY_ID}" | xargs -r docker rmi -f || true
fi

echo "==> Cleanup unused images"
docker image prune -f
