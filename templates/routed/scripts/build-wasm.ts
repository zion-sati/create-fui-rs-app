import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';

function optimizeReleaseWasm(path: string): void {
  const result = spawnSync('wasm-opt', ['-O3', '--strip-debug', '--strip-producers', path, '-o', path], { stdio: 'inherit' });
  if (result.error !== undefined && (result.error as NodeJS.ErrnoException).code === 'ENOENT') {
    console.warn('wasm-opt not found; skipping optional Binaryen release optimization.');
    return;
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const args = process.argv.slice(2);
const buildAll = args.includes('--all');
const routeIndex = args.indexOf('--route');
const routeKey = routeIndex >= 0 ? args[routeIndex + 1] : args.find((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--target');
const targetIndex = process.argv.indexOf('--target');
const target = targetIndex >= 0 ? process.argv[targetIndex + 1] : 'release';
if (target !== 'debug' && target !== 'release') {
  throw new Error('--target must be debug or release.');
}
const manifest = JSON.parse(readFileSync('routes.json', 'utf8')) as { routes: Array<{ key: string; wasmPath: string }> };
const selectedRoutes = buildAll ? manifest.routes : manifest.routes.filter((route) => route.key === routeKey);
if (selectedRoutes.length === 0) throw new Error(`Unknown route key: ${routeKey ?? ''}`);
const releaseArgs = target === 'release' ? ['--release'] : [];
mkdirSync('public', { recursive: true });
for (const route of selectedRoutes) {
  const packageName = `__PACKAGE_NAME__-${route.key}`;
  const crateName = `__CRATE_NAME___${route.key.replaceAll('-', '_')}`;
  const destination = `public/${route.wasmPath.replace(/^\//, '')}`;
  const result = spawnSync('cargo', ['build', '--package', packageName, '--target', 'wasm32-unknown-unknown', ...releaseArgs], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  copyFileSync(`target/wasm32-unknown-unknown/${target}/${crateName}.wasm`, destination);
  if (target === 'release') optimizeReleaseWasm(destination);
}
