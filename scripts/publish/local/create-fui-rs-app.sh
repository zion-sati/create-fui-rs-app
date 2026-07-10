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
MVC_DIR="${TEMP_DIR}/scaffold-mvc-smoke"
run_in_dir "${PACKAGE_DIR}" node dist/src/cli.js "${HELLO_DIR}"
run_in_dir "${PACKAGE_DIR}" node dist/src/cli.js "${MVC_DIR}" --template mvc

if [ -d "${REPO_ROOT}/v2/fui-rs" ] && [ -d "${REPO_ROOT}/v2/browser-bridge" ]; then
  runtime_tarball_name="$(run_in_dir "${REPO_ROOT}/v2/browser-bridge" npm pack --ignore-scripts --pack-destination "${TEMP_DIR}" | tail -n 1)"
  runtime_tarball="${TEMP_DIR}/${runtime_tarball_name}"
  node --input-type=module - "${HELLO_DIR}" "${MVC_DIR}" "${REPO_ROOT}/v2/fui-rs" "${runtime_tarball}" <<'EOF'
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [helloDir, mvcDir, fuiRsPath, runtimeTarball] = process.argv.slice(2);
const escapedPath = fuiRsPath.replaceAll('\\', '\\\\');
const patchCargo = (file, pattern) => {
  const source = readFileSync(file, 'utf8');
  const updated = source.replace(pattern, `fui-rs = { path = "${escapedPath}" }`);
  if (updated === source) throw new Error(`Could not patch ${file}`);
  writeFileSync(file, updated, 'utf8');
};
const patchRuntime = directory => {
  const file = join(directory, 'package.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  manifest.dependencies['@effindomv2/runtime'] = `file:${runtimeTarball}`;
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
};
patchCargo(join(helloDir, 'Cargo.toml'), /fui-rs = "[^"]+"/);
patchCargo(join(mvcDir, 'Cargo.toml'), /fui-rs = "[^"]+"/);
patchRuntime(helloDir);
patchRuntime(mvcDir);
EOF
fi

log_step "Running scaffolded FUI-RS hello app smoke build"
run_in_dir "${HELLO_DIR}" npm install --silent
run_in_dir "${HELLO_DIR}" npm audit --audit-level=low
run_in_dir "${HELLO_DIR}" npm test

log_step "Running scaffolded FUI-RS MVC app smoke build"
run_in_dir "${MVC_DIR}" npm install --silent
run_in_dir "${MVC_DIR}" npm audit --audit-level=low
run_in_dir "${MVC_DIR}" npm test
