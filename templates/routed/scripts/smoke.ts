import { accessSync, existsSync, readFileSync, readdirSync } from 'node:fs';

const routeManifest = JSON.parse(readFileSync('routes.json', 'utf8')) as {
  routes: Array<{ key: string; routePath: string; wasmPath: string }>;
};
const wasmPaths = routeManifest.routes.map((route) => route.wasmPath);
if (wasmPaths.includes('/app.wasm')) throw new Error('Routed projects must not emit app.wasm.');
if (new Set(wasmPaths).size !== wasmPaths.length) {
  throw new Error('Every routed project route must declare a unique wasmPath.');
}
if (existsSync('public/app.wasm')) throw new Error('Routed output contains forbidden public/app.wasm.');
const allowedTopLevelWasm = new Set(wasmPaths.map((path) => path.replace(/^\//u, '')));
for (const entry of readdirSync('public').filter((name) => name.endsWith('.wasm'))) {
  if (!allowedTopLevelWasm.has(entry)) throw new Error(`Undeclared routed application WASM: ${entry}`);
}

for (const file of [
  'public/index.html',
  'public/favicon.ico',
  'public/settings/index.html',
  'public/harness.js',
  'public/home.wasm',
  'public/settings.wasm',
  'public/bridge.js',
  'public/effindom-runtime-config.js',
  'public/runtime/dist/effindom.v2.manifest.json',
]) {
  accessSync(file);
}

for (const generatedBinding of [
  'crates/shared/src/generated/host_services.rs',
  'crates/routes/home/src/generated/host_events.rs',
  'crates/routes/settings/src/generated/host_events.rs',
]) {
  accessSync(generatedBinding);
}

for (const shell of ['public/index.html', 'public/settings/index.html']) {
  if (!readFileSync(shell, 'utf8').includes('id="fui-canvas"')) {
    throw new Error(`${shell} is missing #fui-canvas.`);
  }
  if (readFileSync(shell, 'utf8').includes('{{LOADING_OVERLAY_')) {
    throw new Error(`${shell} contains unresolved loading-overlay placeholders.`);
  }
}
