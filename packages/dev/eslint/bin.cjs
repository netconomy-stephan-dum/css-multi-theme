#!/usr/bin/env node

const promiseSpawn = require('./utils/promiseSpawn');

const getBin = (bin, cwd = __dirname) =>
  promiseSpawn('yarn', ['bin', bin], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });

(async () => {
  const args = process.argv.slice(2);
  const eslintBin = await getBin('eslint');

  await promiseSpawn('node', [eslintBin, ...args], {
    env: {
      ESLINT_USE_FLAT_CONFIG: true,
      ...process.env,
    },
    stdio: 'inherit',
  }).catch((exitCode) => process.exit(exitCode));
})();
