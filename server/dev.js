import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [
  spawn(process.execPath, ['--env-file-if-exists=.env', 'server/index.js'], { cwd: projectRoot, stdio: 'inherit', env: process.env }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd: projectRoot, stdio: 'inherit', env: process.env }),
];

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = code;
}

for (const child of children) {
  child.on('error', error => { console.error('Could not start a development process:', error.message); shutdown(1); });
  child.on('exit', code => { if (!shuttingDown && code !== 0) shutdown(code || 1); });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
console.log('Starting the API on http://localhost:3000 and Vite on http://localhost:5173.');
