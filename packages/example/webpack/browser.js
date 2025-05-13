const path = require('node:path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const getBaseConfig = require('./base');
const getTenantOptions = require('./getTenantOptions');
const MultiTenantsPlugin = require('multi-tenant-plugin').default;
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const multiTenantPlugin = new MultiTenantsPlugin(getTenantOptions(false));
const getBrowserConfig = async (env, options) => {
  const base = process.cwd();
  const dist = 'dist/public';
  const name = 'browser';
  const baseConfig = await getBaseConfig(env, { ...options, target: 'web' });

  return Object.assign(baseConfig, {
    entry: {
      main: {
        import: [require.resolve('@example/runtime-browser')],
        layer: 'root',
      },
    },
    module: {
      rules: [...multiTenantPlugin.getAssetRules('root'), ...baseConfig.module.rules],
    },
    name,
    output: {
      filename: './[name]_[contenthash].js',
      path: path.join(base, dist),
      publicPath: '/',
    },
    plugins: [
      ...baseConfig.plugins,
      new ReactRefreshPlugin(),
      multiTenantPlugin,
      new HTMLWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, './index.html'),
        title: '@example App',
      }),
    ],
    target: 'web',
  });
};

module.exports = getBrowserConfig;
