const promiseSpawn = require('./utils/promiseSpawn');
const path = require('node:path');

const PLUGIN_NAME = 'RunAfterEmitPlugin';

class RunScriptWebpackPlugin {
  constructor(options = {}) {
    this.options = {
      args: [...(options.args || [])],
      entry: options.entry,
      env: options.env || process.env,
      nodeArgs: options.nodeArgs || process.execArgv,
      script: options.script,
    };
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise({ name: PLUGIN_NAME }, (compilation) => {
      const { entry, script } = this.options;
      const outputPath = compiler.options.output.path;
      const entryChunk = compilation.entrypoints.get(entry);

      if (entry) {
        const args = [
          '--inspect',
          path.join(outputPath, Array.from(entryChunk.getRuntimeChunk().files).shift()),
        ];
        return promiseSpawn('node', args, {
          stdio: 'inherit',
        });
      } else if (script) {
        return promiseSpawn(script, [], { stdio: 'inherit' });
      }
    });
  }
}

module.exports = RunScriptWebpackPlugin;
