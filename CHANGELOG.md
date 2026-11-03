# Changelog

## 0.4.1 - 2026-11-03

- Updated verified upstream dependency pins.

## 0.4.0 - 2026-11-03

- create-fui-as-app and create-fui-rs-app print their usage and exit successfully for --help and -h, instead of reporting an unknown option.
- Release web builds are optimized for size: web and universal projects build Rust at opt-level "z", and every route and Worker module then goes through Binaryen's wasm-opt -Oz, which strips its function names and toolchain sections.

## 0.2.14 - 2026-10-30

- New applications use concurrently 9.2.5, which takes shell-quote 1.12.0: the 9.2.4 the templates pinned pulled in a shell-quote with a critical command-injection advisory (GHSA-pqg4-j6r4-53mv), which a fresh application's npm audit reported.

## 0.2.13 - 2026-08-08

- Redesigned NavLink as an arbitrary-content navigation host in FUI-AS and FUI-RS.

## 0.2.11 - 2026-08-07

- Updated downstream SDKs, tooling, scaffolders, and demos for EffinDOM 0.2.12.

## 0.2.12 - 2026-08-07

- Updated verified upstream dependency pins.
