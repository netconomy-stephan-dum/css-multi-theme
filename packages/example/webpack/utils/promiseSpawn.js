// TODO: add ts build or use ts-node for cli
// import { SpawnOptions } from 'child_process';
// import spawn from 'cross-spawn';

// type PromiseSpawn = (cmd: string, args: [], options?: SpawnOptions) => Promise<string>;

const logger = console;

const spawn = require('cross-spawn');
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

module.exports = promiseSpawn;
