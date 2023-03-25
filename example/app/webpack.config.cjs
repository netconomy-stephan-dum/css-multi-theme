const path = require('node:path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MultiTenantsWebpackPlugin = require('@multi-tenants/webpack-plugin').default;

const baseTenant = {
  tenantDirs: [],
  tenantName: 'base',
};

const lightTenant = {
  tenantDirs: [path.dirname(require.resolve('@example/tenant-light/package.json'))],
  tenantName: 'light',
};

const darkTenant = {
  tenantDirs: [path.dirname(require.resolve('@example/tenant-dark/package.json'))],
  tenantName: 'dark',
};

const tenants = [darkTenant, lightTenant, baseTenant];

const multiTenantsWebpackPlugin = new MultiTenantsWebpackPlugin(__dirname, tenants);

const svgPipeline = [
  {
    loader: require.resolve('svgo-loader'),
    options: {
      plugins: [
        'removeTitle', // keep for a11y
        'removeDesc', // keep for a11y, but sketch uses it to expose itself
        'removeXMLNS', // inline not necessary
        'minifyStyles', // animations don't work with enabled minifyStyles
      ],
    },
  },
];
const scssPipeline = [require.resolve('sass-loader')];

const config = {
  entry: { browser: path.resolve('./browser.tsx') },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      ...multiTenantsWebpackPlugin.getAssetRules({
        css: scssPipeline,
        svg: svgPipeline,
      }),
      {
        test: /[jt]sx?$/,
        use: [require.resolve('swc-loader')],
      },
    ],
  },
  output: {
    clean: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('./index.html'),
      title: '@example App',
    }),
    multiTenantsWebpackPlugin,
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '...'],
  },
};

module.exports = config;
