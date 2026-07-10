import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

rmSync('public', { recursive: true, force: true });
mkdirSync('public/runtime', { recursive: true });
mkdirSync('public/settings', { recursive: true });
cpSync('node_modules/@effindomv2/runtime/dist', 'public/runtime/dist', { recursive: true });
copyFileSync('node_modules/@effindomv2/runtime/dist/bridge.js', 'public/bridge.js');
writeFileSync(
  'public/effindom-runtime-config.js',
  'window.__effindomRuntime = Object.assign({}, window.__effindomRuntime, { manifestUrl: "/runtime/dist/effindom.v2.manifest.json", buildMode: "release" });\n',
  'utf8',
);
const shell = readFileSync('index.html', 'utf8');
writeFileSync('public/index.html', shell, 'utf8');
writeFileSync('public/settings/index.html', shell, 'utf8');
