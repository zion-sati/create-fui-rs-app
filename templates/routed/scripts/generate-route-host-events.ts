import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('routes.json', 'utf8')) as { routes: Array<{ key: string }> };
for (const route of manifest.routes) {
  const result = spawnSync('tsx', [
    './node_modules/@effindomv2/fui-rs/scripts/generate-host-events.ts',
    'host/host-events.ts',
    'appHostEvents',
    `crates/routes/${route.key}/src/generated/host_events.rs`,
  ], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
