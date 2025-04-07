import spawn from 'cross-spawn';

const PLUGIN_NAME = 'RunScriptWebpackPlugin';

class RunScriptWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.worker = null;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap({ name: PLUGIN_NAME }, () => {
      const { command, args } = this.options;
      if (!this.worker) {
        this.worker = spawn(command, args, { stdio: 'inherit' });
      }
    });
  }
}

const runServer = () => {
  return {
    dependencies: ['browser', 'server'],
    entry: {},
    name: 'runServer',
    plugins: [
      new RunScriptWebpackPlugin({
        args: ['--inspect', './dist/private/main.js'],
        command: 'node',
      }),
    ],
  };
};

export default runServer;
