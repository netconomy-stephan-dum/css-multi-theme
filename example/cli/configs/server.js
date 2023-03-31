const path = require('node:path');
const { HotModuleReplacementPlugin, WatchIgnorePlugin, ProvidePlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals');
const dist = 'dist';
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const base = process.cwd();

const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

const serverConfig = {
  stats: 'minimal',
  entry: ['webpack/hot/poll?100', path.join(base, 'server.ts')],
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
    {
      express: 'express',
    },
  ],
  externalsPresets: {
    node: true,
  },
  externalsType: 'commonjs',
  mode,
  module: {
    rules: [
      {
        loader: require.resolve('ts-loader'),
        test: /\.[tj]sx?$/,
      },
    ],
  },
  name: 'server-engine',
  output: {
    filename: './[name].js',
    path: path.join(base, dist, 'private'),
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new WatchIgnorePlugin({
      paths: [/\.js$/, /\.d\.ts$/],
    }),
    new RunScriptWebpackPlugin({ autoRestart: false }),
    new ProvidePlugin({
      express: require.resolve('express'),
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '...'],
  },
  target: 'node',
};

module.exports = serverConfig;
