import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const versionsPath = join(packageDirectory, 'src', 'versions.ts');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const npmView = (...arguments_) => execFileSync(npm, ['view', ...arguments_], { encoding: 'utf8' }).trim();

const fuiVersion = process.env.FUI_RS_VERSION ?? npmView('@effindomv2/fui-rs', 'dist-tags.latest');
const runtimeVersion = process.env.EFFINDOM_RUNTIME_VERSION
  ?? npmView(`@effindomv2/fui-rs@${fuiVersion}`, 'dependencies.@effindomv2/runtime');
if (!versionPattern.test(fuiVersion) || !versionPattern.test(runtimeVersion)) {
  throw new Error(`npm returned invalid upstream versions: FUI-RS ${JSON.stringify(fuiVersion)}, runtime ${JSON.stringify(runtimeVersion)}`);
}

const previous = readFileSync(versionsPath, 'utf8');
const next = `export const FUI_RS_VERSION = '${fuiVersion}';\nexport const RUNTIME_VERSION = '${runtimeVersion}';\n`;
if (previous !== next) writeFileSync(versionsPath, next);
console.log(`Pinned @effindomv2/fui-rs@${fuiVersion} with @effindomv2/runtime@${runtimeVersion}.`);
