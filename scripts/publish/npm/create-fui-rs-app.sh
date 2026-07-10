#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/common.sh"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="${REPO_ROOT}/v2/create-fui-rs-app"
if [ ! -f "${PACKAGE_DIR}/package.json" ]; then
  PACKAGE_DIR="${REPO_ROOT}"
fi

bash "${SCRIPT_DIR}/../local/create-fui-rs-app.sh"
publish_package "${PACKAGE_DIR}" "$@"
