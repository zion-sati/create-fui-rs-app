#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/common.sh"

PACKAGE_DIR="${REPO_ROOT}/v2/create-fui-rs-app"
if [ ! -f "${PACKAGE_DIR}/package.json" ]; then
  PACKAGE_DIR="${REPO_ROOT}"
fi
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TEMP_DIR}"' EXIT

log_step "Running @effindomv2/create-fui-rs-app publish checks"
ensure_npm_deps "${PACKAGE_DIR}" "npm install --silent"
run_in_dir "${PACKAGE_DIR}" npm run lint
run_in_dir "${PACKAGE_DIR}" npm run typecheck
run_in_dir "${PACKAGE_DIR}" npm test
run_in_dir "${PACKAGE_DIR}" npm pack --dry-run >/dev/null

HELLO_DIR="${TEMP_DIR}/scaffold-smoke"
ROUTED_DIR="${TEMP_DIR}/scaffold-routed-smoke"
run_in_dir "${PACKAGE_DIR}" node dist/src/cli.js "${HELLO_DIR}"
run_in_dir "${PACKAGE_DIR}" node dist/src/cli.js "${ROUTED_DIR}" --template routed

FUI_RS_PACKAGE_DIR="${FUI_RS_PACKAGE_DIR:-}"
if [ -z "${FUI_RS_PACKAGE_DIR}" ]; then
  for candidate in \
    "${REPO_ROOT}/v2/fui-rs" \
    "${REPO_ROOT}/../fui-rs/v2/fui-rs" \
    "${REPO_ROOT}/../FUI-RS/v2/fui-rs"; do
    if [ -f "${candidate}/package.json" ] && [ -f "${candidate}/Cargo.toml" ]; then
      FUI_RS_PACKAGE_DIR="${candidate}"
      break
    fi
  done
fi

RUNTIME_PACKAGE_DIR="${RUNTIME_PACKAGE_DIR:-}"
if [ -z "${RUNTIME_PACKAGE_DIR}" ]; then
  for candidate in \
    "${REPO_ROOT}/v2/browser-bridge" \
    "${REPO_ROOT}/../EffinDOM/v2/browser-bridge" \
    "${REPO_ROOT}/../effindom/v2/browser-bridge"; do
    if [ -f "${candidate}/package.json" ]; then
      RUNTIME_PACKAGE_DIR="${candidate}"
      break
    fi
  done
fi

fui_rs_tarball=""
if [ -n "${FUI_RS_PACKAGE_DIR}" ]; then
  fui_rs_tarball_name="$(run_in_dir "${FUI_RS_PACKAGE_DIR}" npm pack --ignore-scripts --pack-destination "${TEMP_DIR}" | tail -n 1)"
  fui_rs_tarball="${TEMP_DIR}/${fui_rs_tarball_name}"
fi

runtime_tarball=""
if [ -n "${RUNTIME_PACKAGE_DIR}" ]; then
  runtime_tarball_name="$(run_in_dir "${RUNTIME_PACKAGE_DIR}" npm pack --ignore-scripts --pack-destination "${TEMP_DIR}" | tail -n 1)"
  runtime_tarball="${TEMP_DIR}/${runtime_tarball_name}"
fi

if [ -n "${fui_rs_tarball}" ] || [ -n "${runtime_tarball}" ]; then
  node --input-type=module - "${HELLO_DIR}" "${ROUTED_DIR}" "${fui_rs_tarball}" "${runtime_tarball}" <<'EOF'
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [helloDir, routedDir, fuiRsTarball, runtimeTarball] = process.argv.slice(2);
const patchDependencies = directory => {
  const file = join(directory, 'package.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  if (fuiRsTarball.length > 0) {
    manifest.dependencies['@effindomv2/fui-rs'] = `file:${fuiRsTarball}`;
  }
  if (runtimeTarball.length > 0) {
    manifest.dependencies['@effindomv2/runtime'] = `file:${runtimeTarball}`;
  }
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
};
patchDependencies(helloDir);
patchDependencies(routedDir);
EOF
fi

log_step "Running scaffolded FUI-RS hello app smoke build"
run_in_dir "${HELLO_DIR}" npm install --silent
run_in_dir "${HELLO_DIR}" npm audit --audit-level=low
run_in_dir "${HELLO_DIR}" npm test

log_step "Running scaffolded FUI-RS routed app smoke build"
run_in_dir "${ROUTED_DIR}" npm install --silent
run_in_dir "${ROUTED_DIR}" npm audit --audit-level=low
run_in_dir "${ROUTED_DIR}" npm test
