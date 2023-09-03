const path = require('node:path');

const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const getManifestSyncRule = require('multi-tenants/dist/rules/manifestSync').default;
const getTenantOptions = require('./getTenantOptions');
const WebpackStatsPlugin = require('@loadable/webpack-plugin');
const getBaseConfig = require('./base');
const MultiTenantsPlugin = require('multi-tenants').default;

const multiTenantPlugin = new MultiTenantsPlugin(getTenantOptions());

const getServerConfig = async (env, options) => {
  const { WEBPACK_SERVE } = env;
  const base = process.cwd();
  const dist = 'dist';

  const config = await getBaseConfig(env, options);

  Object.assign(config, {
    entry: {
      server: [
        `${require.resolve('webpack/hot/poll')}?100`,
        require.resolve('@example/engine-server'),
      ],
    },
    // externals: [
    //   nodeExternals({
    //     allowlist: ['webpack/hot/poll?100'],
    //   }),
    // ],
    externalsPresets: {
      node: true,
    },
    externalsType: 'commonjs',
    module: {
      rules: [
        ...config.module.rules,
        ...multiTenantPlugin.getAssetRules(),
        // {
        //   test: /\.(c|s[ca])ss$/,
        //   type: 'javascript/auto',
        //   use: [
        //     {
        //       loader: require.resolve('css-loader'),
        //       options: {
        //         modules: {
        //           exportOnlyLocals: true,
        //         },
        //       },
        //     },
        //     {
        //       loader: require.resolve('postcss-loader'),
        //     },
        //   ],
        // },
      ],
    },
    name: 'server',
    output: {
      filename: './[name].js',
      path: path.join(base, dist, 'private'),
    },
    plugins: [...config.plugins, new WebpackStatsPlugin()],
    target: 'node',
  });

  if (WEBPACK_SERVE) {
    config.plugins.push(
      new RunScriptWebpackPlugin({
        autoRestart: false,
        name: './server.js',
        nodeArgs: ['--inspect'],
      }),
    );
  }

  return config;
};

module.exports = getServerConfig;
