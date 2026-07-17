import { accessSync, readFileSync } from 'node:fs';

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
