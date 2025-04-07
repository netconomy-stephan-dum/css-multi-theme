import { spawn } from 'cross-spawn';
import execSync from '@example/cli-utils/promiseSpawn.js';
import { Argument, program } from 'commander';
import {join} from 'node:path';

const logger = console;

const getDebugFlag = (debug) => {
  if (!debug || debug === 'false') {
    return '';
  }
  if (debug === 'true' || debug === true) {
    return '--inspect-brk';
  }
  return debug;
};

const commonArgs = [
  '--config',
  join(import.meta.dirname,'./rspack.config.mjs'),
];

const getArgsByTask = {
  build: () => [
    'build',
    ...commonArgs,
    '--mode=production'
  ],

  serve: () => [
    'serve',
    ...commonArgs,
    '--mode=development',
  ],
};

const promiseSpawn = (cmd, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);
    const data = [];
    child.stdout?.on('data', (chunk) => {
      data.push(chunk);
    });
    child.stderr?.on('data', (error) => {
      logger.log(error);
    });
    child.on('error', (error) => {
      logger.log('child error', error);
    });
    child.on('close', (exitCode) => (exitCode ? reject(exitCode) : resolve(data.join(''))));
  });

const spawnRspack = async (task, options, command) => {
  const { debug } = options;
  const rspackBin = (await execSync('yarn', ['bin', 'rspack'], { cwd: import.meta.dirname })).trim();

  const nodeArgs = [];

  const debugFlag = getDebugFlag(debug);
  if (debugFlag) {
    nodeArgs.push(debugFlag);
  }
  const args = [...nodeArgs, rspackBin, ...getArgsByTask[task](), ...command.args.slice(1)];
  logger.log(...args);

  return promiseSpawn('node', args, { stdio: 'inherit'})
}
program
  .addArgument(
    new Argument('<task>', 'which task to execute').choices(['serve', 'build']).default('build'),
  )
  .option('--debug [debug]', 'add inspect-brk to webpack process')
  .allowUnknownOption()
  .action(spawnRspack);
(async () => {
  await program.parseAsync();
})();


