import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';

const routeKey = process.argv[2];
const routes = {
  home: {
    packageName: '__PACKAGE_NAME__-home',
    source: 'target/wasm32-unknown-unknown/release/__CRATE_NAME___home.wasm',
    destination: 'public/home.wasm',
  },
  settings: {
    packageName: '__PACKAGE_NAME__-settings',
    source: 'target/wasm32-unknown-unknown/release/__CRATE_NAME___settings.wasm',
    destination: 'public/settings.wasm',
  },
} as const;

if (routeKey !== 'home' && routeKey !== 'settings') {
  throw new Error('Usage: tsx scripts/build-wasm.ts <home|settings>');
}

const route = routes[routeKey];
const result = spawnSync(
  'cargo',
  ['build', '--package', route.packageName, '--target', 'wasm32-unknown-unknown', '--release'],
  { stdio: 'inherit' },
);
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

mkdirSync('public', { recursive: true });
copyFileSync(route.source, route.destination);
