const path = require('node:path');

const nodeExternals = require('webpack-node-externals');
const getTenantOptions = require('./getTenantOptions');
const getBaseConfig = require('./base');
const MultiTenantsPlugin = require('multi-tenant-plugin').default;

const multiTenantPlugin = new MultiTenantsPlugin(getTenantOptions(true));

const getServerConfig = async (env, options) => {
  const base = process.cwd();
  const dist = 'dist';

  const config = await getBaseConfig(env, { options, target: 'node' });

  Object.assign(config, {
    entry: {
      main: {
        import: [require.resolve('@example/runtime-server')],
        layer: 'root',
      },
    },
    externals: [
      nodeExternals({
        allowlist: ['multi-tenant-plugin/manifestByTenant', /@example/],
      }),
    ],
    externalsPresets: {
      node: true,
    },
    externalsType: 'commonjs',
    module: {
      rules: [...config.module.rules, ...multiTenantPlugin.getAssetRules('root')],
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
