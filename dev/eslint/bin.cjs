#!/usr/bin/env node

const promiseSpawn = require('./utils/promiseSpawn');

const getBin = (bin, cwd = __dirname) =>
  promiseSpawn('yarn', ['bin', bin], {
    stdio: 'pipe',
    cwd,
    encoding: 'utf8',
  });

(async () => {
  const args = process.argv.slice(2);
  const eslintBin = await getBin('eslint');

  await promiseSpawn('node', [eslintBin, ...args], {
    stdio: 'inherit',
    env: {
      ESLINT_USE_FLAT_CONFIG: true,
      ...process.env,
    },
  });
})();
