const path = require('node:path');
const getBaseConfig = require('./base');
const getTenantOptions = require('./getTenantOptions');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const MultiTenantsPlugin = require('multi-tenants').default;

const multiTenantPlugin = new MultiTenantsPlugin(getTenantOptions(false));
const getBrowserConfig = (env, options) => {
  const base = process.cwd();
  const dist = 'dist';
  const name = 'browser';
  const baseConfig = getBaseConfig(env, options);

  return Object.assign(baseConfig, {
    entry: {
      main: [require.resolve('@example/engine-browser')],
    },
    module: {
      rules: [...multiTenantPlugin.getAssetRules(), ...baseConfig.module.rules],
    },
    name,
    output: {
      filename: './[name]_[contenthash].js',
      path: path.join(base, dist),
      publicPath: '/',
    },
    plugins: [
      ...baseConfig.plugins,
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
