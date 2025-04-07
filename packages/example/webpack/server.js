const path = require('node:path');

const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const getTenantOptions = require('./getTenantOptions');
const getBaseConfig = require('./base');
const MultiTenantsPlugin = require('multi-tenants').default;

const multiTenantPlugin = new MultiTenantsPlugin(getTenantOptions(true));

const getServerConfig = async (env, options) => {
  const { WEBPACK_SERVE } = env;
  const base = process.cwd();
  const dist = 'dist';

  const config = await getBaseConfig(env, { options, target: 'node' });

  Object.assign(config, {
    entry: {
      main: {
        import: [
          // `${require.resolve('webpack/hot/poll')}?100`,
          require.resolve('@example/runtime-server'),
        ],
        layer: 'root',
      },
    },
    // externals: [
    //   nodeExternals({
    //     allowlist: ['webpack/hot/poll?100', 'multi-tenants/manifestByTenant', /@example/],
    //   }),
    // ],
    externalsPresets: {
      node: true,
    },
    externalsType: 'commonjs',
    module: {
      rules: [...config.module.rules, ...multiTenantPlugin.getAssetRules()],
    },
    name: 'server',
    output: {
      filename: './[name].js',
      path: path.join(base, dist, 'private'),
    },
    plugins: [...config.plugins, multiTenantPlugin],
    target: 'node',
  });

  return config;
};

module.exports = getServerConfig;
