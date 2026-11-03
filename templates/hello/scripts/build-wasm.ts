import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';

// The browser downloads a route's WebAssembly before the route starts, so release modules are optimized for size with
// the pinned Binaryen and stripped of the names, toolchain record and feature list the browser never reads.
function optimizeReleaseWasm(path: string): void {
  const wasmOpt = 'node_modules/binaryen/bin/wasm-opt';
  const result = spawnSync(
    process.execPath,
    [wasmOpt, path, '-Oz', '--strip-debug', '--strip-producers', '--strip-target-features', '-o', path],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const targetIndex = process.argv.indexOf('--target');
const target = targetIndex >= 0 ? process.argv[targetIndex + 1] : 'release';
if (target !== 'debug' && target !== 'release') {
  throw new Error('--target must be debug or release.');
}
const releaseArgs = target === 'release' ? ['--release'] : [];
const result = spawnSync('cargo', ['build', '--target', 'wasm32-unknown-unknown', ...releaseArgs], {
  stdio: 'inherit',
});
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

mkdirSync('public', { recursive: true });
copyFileSync(`target/wasm32-unknown-unknown/${target}/__CRATE_NAME__.wasm`, 'public/app.wasm');
if (target === 'release') optimizeReleaseWasm('public/app.wasm');
