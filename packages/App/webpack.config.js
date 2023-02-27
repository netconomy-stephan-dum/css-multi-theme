const path = require('node:path');
const ExtractCSSModulesPlugin = require("@micro/webpack/plugins/ExtractCSSModulesPlugin");
const HTMLWebpackPlugin = require('html-webpack-plugin');

const config = {
  entry: { browser: path.resolve("./browser.ts")},
  plugins: [
    new HTMLWebpackPlugin({
      title: '@Micro App',
      template: path.resolve('./index.html'),
      filename: 'index.html'
    }),
    new ExtractCSSModulesPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '...']
  },
  module: {
    rules: [
      {
        test: /[jt]sx?$/,
        use: [
          require.resolve("swc-loader")
        ],
      },
      {
        test: /scss$/,
        use: [
          require.resolve('@micro/webpack/loader/ExtractCSSModulesLoader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: {
                exportOnlyLocals: true,
              }
            },
          },
          require.resolve('sass-loader'),
        ],
      },
    ],
  },
};

module.exports = config;
