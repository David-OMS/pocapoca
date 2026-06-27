import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const distIndex = path.join(projectRoot, 'client', 'dist', 'index.html');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NPM_CONFIG_PRODUCTION: 'false' },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(distIndex)) {
  console.log('client/dist missing — running production build...');
  run('npm', ['run', 'build']);
}

if (!fs.existsSync(distIndex)) {
  console.error('Build failed: client/dist/index.html still missing.');
  process.exit(1);
}

run('node', ['server/index.js']);
