import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createProject } from '../src/scaffold.js';
import { FUI_RS_VERSION, RUNTIME_VERSION } from '../src/versions.js';

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

void test('createProject writes hello scaffold without manual lifecycle exports', () => {
  const root = mkdtempSync(join(tmpdir(), 'create-fui-rs-app-'));
  const target = join(root, 'my-rust-app');
  try {
    createProject({ targetDirectory: target, projectName: 'my-rust-app' });
    const cargo = readFileSync(join(target, 'Cargo.toml'), 'utf8');
    const source = readFileSync(join(target, 'src', 'lib.rs'), 'utf8');
    const shell = readFileSync(join(target, 'index.html'), 'utf8');
    const loadingOverlay = readFileSync(join(target, 'loading-overlay-body.html'), 'utf8');
    const packageJson = readJson(join(target, 'package.json')) as {
      dependencies: Record<string, string>;
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
      allowScripts: Record<string, boolean>;
    };
    assert.equal(cargo.includes('crate-type = ["cdylib"]'), true);
    assert.equal(cargo.includes('fui-rs = { path = "node_modules/@effindomv2/fui-rs" }'), true);
    assert.equal(packageJson.dependencies['@effindomv2/fui-rs'], FUI_RS_VERSION);
    assert.equal(packageJson.dependencies['@effindomv2/runtime'], RUNTIME_VERSION);
    assert.equal(source.includes('fui_app!(HelloWorld, HelloWorld::new)'), true);
    assert.equal(source.includes('Application::caption("my-rust-app")'), true);
    assert.equal(source.includes('button("Click me")'), true);
    assert.equal(source.includes('bind_theme'), true);
    assert.equal(source.includes('fui_component!(HelloWorld => root)'), true);
    assert.equal(source.includes('_theme_guard'), false);
    assert.equal(source.includes('#[no_mangle]'), false);
    assert.equal(source.includes('extern "C" fn __runApp'), false);
    assert.equal(typeof packageJson.scripts.build, 'string');
    assert.equal(packageJson.scripts['build:wasm'], 'tsx scripts/build-wasm.ts --target release');
    assert.equal(typeof packageJson.scripts['build:dev'], 'string');
    assert.equal(typeof packageJson.scripts.watch, 'string');
    assert.equal(packageJson.scripts.serve, 'sirv public --dev --host 0.0.0.0 --port 8080');
    assert.equal(packageJson.devDependencies['sirv-cli'], '3.0.1');
    assert.equal(packageJson.scripts.publish, 'npm run build && npm run publish:stage');
    assert.equal(packageJson.scripts['publish:stage'], 'tsx scripts/stage-publish.ts');
    assert.equal(shell.includes('id="fui-canvas"'), true);
    assert.equal(loadingOverlay.includes('data-effindom-loading-visual'), true);
    assert.equal(loadingOverlay.includes('__effindomLoadingBootstrap'), true);
    assert.equal(loadingOverlay.includes('Runtime assets'), true);
    assert.equal(loadingOverlay.includes('effindom-loading-progress'), true);
    assert.equal(readFileSync(join(target, 'loading-overlay-styles.html'), 'utf8').includes('user-select: none'), true);
    assert.equal(packageJson.devDependencies.esbuild, '0.28.1');
    assert.equal(packageJson.allowScripts['esbuild@0.28.1'], true);
    assert.equal(existsSync(join(target, 'scripts', 'build-wasm.ts')), true);
    assert.equal(existsSync(join(target, 'scripts', 'stage-publish.ts')), true);
    assert.equal(existsSync(join(target, '.gitignore')), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

void test('createProject writes routed scaffold with separate route wasm crates', () => {
  const root = mkdtempSync(join(tmpdir(), 'create-fui-rs-app-'));
  const target = join(root, 'my-routed-app');
  try {
    createProject({ targetDirectory: target, projectName: 'my-routed-app', template: 'routed' });
    const workspace = readFileSync(join(target, 'Cargo.toml'), 'utf8');
    const routes = readJson(join(target, 'routes.json')) as { routes: { wasmPath: string }[] };
    const home = readFileSync(join(target, 'crates', 'routes', 'home', 'src', 'lib.rs'), 'utf8');
    const settings = readFileSync(join(target, 'crates', 'routes', 'settings', 'src', 'lib.rs'), 'utf8');
    const shared = readFileSync(join(target, 'crates', 'shared', 'src', 'lib.rs'), 'utf8');
    const shell = readFileSync(join(target, 'index.html'), 'utf8');
    const loadingOverlay = readFileSync(join(target, 'loading-overlay-body.html'), 'utf8');
    const packageJson = readJson(join(target, 'package.json')) as {
      dependencies: Record<string, string>;
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
      allowScripts: Record<string, boolean>;
    };
    assert.equal(workspace.includes('"crates/routes/*"'), true);
    assert.equal(workspace.includes('fui-rs = { path = "node_modules/@effindomv2/fui-rs" }'), true);
    assert.equal(packageJson.dependencies['@effindomv2/fui-rs'], FUI_RS_VERSION);
    assert.equal(packageJson.dependencies['@effindomv2/runtime'], RUNTIME_VERSION);
    assert.deepEqual(routes.routes.map((route) => route.wasmPath), ['/home.wasm', '/settings.wasm']);
    assert.equal(home.includes('fui_app!(HomePage, HomePage::new)'), true);
    assert.equal(settings.includes('fui_app!(SettingsPage, SettingsPage::new)'), true);
    assert.equal(home.includes('Application::caption("my-routed-app • Home")'), true);
    assert.equal(settings.includes('Application::caption("my-routed-app • Settings")'), true);
    assert.equal(home.includes('fui_component!(HomePage => root);'), true);
    assert.equal(home.includes('Rc<Vec<HostEventSubscription>>'), true);
    assert.equal(settings.includes('fui_component!(SettingsPage => root)'), true);
    assert.equal(shared.includes('fui_component!(StarterNavBar => root)'), true);
    assert.equal(home.includes('Host service time:'), true);
    assert.equal(home.includes('Host event tick:'), true);
    assert.equal(home.includes('on_app_clock_tick'), true);
    assert.equal(shared.includes('.font_size(14.0)'), true);
    assert.equal(shared.includes('theme.colors.accent'), true);
    assert.equal(home.includes('_theme_guard'), false);
    assert.equal(settings.includes('_theme_guard'), false);
    assert.equal(shared.includes('_theme_guard'), false);
    assert.equal(home.includes('_nav_bar:'), false);
    assert.equal(settings.includes('_nav_bar:'), false);
    assert.equal(existsSync(join(target, 'crates', 'shared', 'src', 'lib.rs')), true);
    assert.equal(home.includes('#[no_mangle]'), false);
    assert.equal(settings.includes('#[no_mangle]'), false);
    assert.equal(packageJson.scripts['build:wasm'], 'tsx scripts/build-wasm.ts --all --target release');
    assert.equal(typeof packageJson.scripts['build:dev'], 'string');
    assert.equal(typeof packageJson.scripts['generate:host'], 'string');
    assert.equal(typeof packageJson.scripts.watch, 'string');
    assert.equal(packageJson.scripts.serve, 'sirv public --dev --host 0.0.0.0 --port 8080');
    assert.equal(packageJson.devDependencies['sirv-cli'], '3.0.1');
    assert.equal(packageJson.scripts.publish, 'npm run build && npm run publish:stage');
    assert.equal(packageJson.scripts['publish:stage'], 'tsx scripts/stage-publish.ts');
    assert.equal(shell.includes('id="fui-canvas"'), true);
    assert.equal(loadingOverlay.includes('data-effindom-loading-visual'), true);
    assert.equal(loadingOverlay.includes('__effindomLoadingBootstrap'), true);
    assert.equal(loadingOverlay.includes('Runtime assets'), true);
    assert.equal(loadingOverlay.includes('effindom-loading-progress'), true);
    assert.equal(readFileSync(join(target, 'loading-overlay-styles.html'), 'utf8').includes('user-select: none'), true);
    assert.equal(packageJson.devDependencies.esbuild, '0.28.1');
    assert.equal(packageJson.allowScripts['esbuild@0.28.1'], true);
    assert.equal(existsSync(join(target, 'scripts', 'build-wasm.ts')), true);
    assert.equal(existsSync(join(target, 'scripts', 'stage-publish.ts')), true);
    assert.equal(existsSync(join(target, 'host', 'host-services.ts')), true);
    assert.equal(existsSync(join(target, 'host', 'host-events.ts')), true);
    assert.equal(packageJson.scripts['generate:host-events'], 'tsx scripts/generate-route-host-events.ts');
    assert.equal(existsSync(join(target, 'scripts', 'generate-route-host-events.ts')), true);
    assert.equal(existsSync(join(target, 'src', 'routes.rs')), false);
    assert.equal(existsSync(join(target, '.gitignore')), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
