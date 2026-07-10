import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';

const result = spawnSync('cargo', ['build', '--target', 'wasm32-unknown-unknown', '--release'], {
  stdio: 'inherit',
});
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

mkdirSync('public', { recursive: true });
copyFileSync('target/wasm32-unknown-unknown/release/__CRATE_NAME__.wasm', 'public/app.wasm');
