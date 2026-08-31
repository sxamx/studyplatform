const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando StudyPlatform (Backend + Frontend)...');
console.log('\x1b[36m%s\x1b[0m', '================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../backend'),
  stdio: 'pipe',
  shell: true,
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[Backend]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// 2. Start Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../frontend'),
  stdio: 'pipe',
  shell: true,
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Frontend Error]\x1b[0m ${data}`);
});

// Clean shutdown
function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Cerrando servidores...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
