import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type TemplateName = 'hello' | 'mvc';

export interface TemplateContext {
  readonly projectName: string;
  readonly packageName: string;
  readonly crateName: string;
}

const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'templates');
const BINARY_TEMPLATE_FILES = new Set<string>(['favicon.ico']);

function collectTemplateFiles(root: string, relativePath = ''): Map<string, string> {
  const absolutePath = resolve(root, relativePath);
  const stats = statSync(absolutePath);
  if (stats.isFile()) {
    return new Map([[relativePath, readFileSync(absolutePath, 'utf8')]]);
  }

  const output = new Map<string, string>();
  for (const entry of readdirSync(absolutePath)) {
    const nestedRelativePath = relativePath.length === 0 ? entry : `${relativePath}/${entry}`;
    const nestedAbsolutePath = resolve(root, nestedRelativePath);
    const nestedStats = statSync(nestedAbsolutePath);
    if (nestedStats.isDirectory()) {
      for (const [filePath, contents] of collectTemplateFiles(root, nestedRelativePath)) {
        output.set(filePath, contents);
      }
      continue;
    }
    if (BINARY_TEMPLATE_FILES.has(nestedRelativePath)) {
      continue;
    }
    output.set(nestedRelativePath, readFileSync(nestedAbsolutePath, 'utf8'));
  }
  return output;
}

function replaceTemplateTokens(value: string, context: TemplateContext): string {
  return value
    .replaceAll('__PROJECT_NAME__', context.projectName)
    .replaceAll('__PACKAGE_NAME__', context.packageName)
    .replaceAll('__CRATE_NAME__', context.crateName);
}

function outputPathForTemplate(filePath: string): string {
  return filePath === 'gitignore' ? '.gitignore' : filePath;
}

export function createTemplateFiles(template: TemplateName, context: TemplateContext): Map<string, string> {
  const files = collectTemplateFiles(resolve(TEMPLATE_ROOT, template));
  const output = new Map<string, string>();
  for (const [filePath, contents] of files) {
    output.set(outputPathForTemplate(filePath), replaceTemplateTokens(contents, context));
  }
  return output;
}

export function copyTemplateBinaryAssets(template: TemplateName, destinationDirectory: string): void {
  for (const binaryFile of BINARY_TEMPLATE_FILES) {
    const sourcePath = resolve(TEMPLATE_ROOT, template, binaryFile);
    if (!existsSync(sourcePath)) {
      continue;
    }
    const destinationPath = resolve(destinationDirectory, binaryFile);
    mkdirSync(dirname(destinationPath), { recursive: true });
    copyFileSync(sourcePath, destinationPath);
  }
}
