#!/usr/bin/env bash
set -euo pipefail

IMAGE="${1:?Usage: smoke-test.sh IMAGE PORT}"
PORT="${2:?Usage: smoke-test.sh IMAGE PORT}"

CONTAINER="smoke-test-$$"
BASE_URL="http://127.0.0.1:${PORT}"

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting container: $IMAGE"

docker run -d \
  --name "$CONTAINER" \
  -p "127.0.0.1:${PORT}:3000" \
  "$IMAGE" >/dev/null

check_endpoint() {
  local path="$1"
  local expected="$2"
  local response=""

  for attempt in $(seq 1 30); do
    if response=$(curl --silent --show-error --fail \
      "$BASE_URL$path" 2>/dev/null); then

      if [ "$response" = "$expected" ]; then
        echo "PASS: GET $path"
        return 0
      fi

      echo "FAIL: GET $path - Unexpected response: $response"
      return 1
    fi

    sleep 1
  done

  echo "FAIL: GET $path - Endpoint unavailable"
  docker logs "$CONTAINER" || true
  return 1
}

check_endpoint "/" "Products API is running"
check_endpoint "/health" '{"status":"ok"}'
check_endpoint "/products" "[]"

echo "SMOKE TEST: PASSED"
