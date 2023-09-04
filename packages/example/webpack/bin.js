const { program, Argument } = require('commander');
const promiseSpawn = require('@example/cli-utils/promiseSpawn');

const logger = console;

const defaultConfigNames = ['server', 'browser'];

const getConfigPaths = (configNames) =>
  configNames.map((configName) => ['-c', require.resolve(`./${configName}.js`)]).flat();

const getArgsByTask = {
  build: () => ['build', ...getConfigPaths(defaultConfigNames), '--progress'],
  serve: () => [
    'serve',
    ...getConfigPaths(['devServer', ...defaultConfigNames]),
    '--progress',
    '--mode=development',
    // '--mode=production',
  ],
};

const getDebugFlag = (debug) => {
  if (!debug || debug === 'false') {
    return '';
  }
  if (debug === 'true' || debug === true) {
    return '--inspect-brk';
  }
  return debug;
};
const spawnWebpack = async (task, options, command) => {
  const { debug } = options;
  const webpackBin = (
    await promiseSpawn('yarn', ['bin', 'webpack-cli'], { cwd: __dirname })
  ).trim();
  const nodeArgs = [];

  const debugFlag = getDebugFlag(debug);
  if (debugFlag) {
    nodeArgs.push(debugFlag);
  }

  const args = [...nodeArgs, webpackBin, ...getArgsByTask[task](), ...command.args.slice(1)];
  logger.log(...args);
  return promiseSpawn('node', args, { stdio: 'inherit' });
};

program
  .addArgument(
    new Argument('<task>', 'which task to execute').choices(['serve', 'build']).default('build'),
  )
  .option('--debug [debug]', 'add inspect-brk to webpack process')
  .allowUnknownOption()
  .action(spawnWebpack);

(async () => {
  await program.parseAsync();
})();
