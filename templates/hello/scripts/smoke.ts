import { accessSync } from 'node:fs';

for (const file of [
  'public/index.html',
  'public/harness.js',
  'public/app.wasm',
  'public/bridge.js',
  'public/effindom-runtime-config.js',
  'public/runtime/dist/effindom.v2.manifest.json',
]) {
  accessSync(file);
}
