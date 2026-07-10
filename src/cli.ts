#!/usr/bin/env node
import { runCli } from './scaffold.js';

process.exitCode = runCli(process.argv.slice(2), process.cwd(), console);
