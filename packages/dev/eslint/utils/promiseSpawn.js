const spawn = require('cross-spawn');

const promiseSpawn = (command, args = [], config = {}, env = {}) =>
  new Promise((resolve, reject) => {
    const data = [];
    const child = spawn(command, args, {
      ...config,
      env: {
        ...(config.env || {}),
        ...process.env,
        ...env,
      },
    }).on('close', (errorCode) => (errorCode ? reject(errorCode) : resolve(data.join('').trim())));

    if (config.stdio === 'pipe') {
      child.stdout.on('data', (chunk) => {
        data.push(chunk.toString());
      });
    }
  });

module.exports = promiseSpawn;
