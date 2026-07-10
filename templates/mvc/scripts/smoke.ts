import { accessSync } from 'node:fs';

for (const file of [
  'public/index.html',
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
