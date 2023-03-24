const path = require('node:path');
const MultiTenantsWebpackPlugin = require("multi-tenants-webpack-plugin");
const HTMLWebpackPlugin = require('html-webpack-plugin');

const baseTenant = {
  tenantName: 'base',
  assetDir: 'assets/base',
  tenantDirs: [],
};

const lightTenant = {
  tenantName: 'light',
  assetDir: 'assets/light',
  tenantDirs: [
    path.dirname(require.resolve('@example/tenant-light/package.json'))
  ],
};

const darkTenant = {
  tenantName: 'dark',
  assetDir: 'assets/dark',
  tenantDirs: [
    path.dirname(require.resolve('@example/tenant-dark/package.json'))
  ]
};

const tenants = [darkTenant, lightTenant, baseTenant];

const multiTenantsWebpackPlugin = new MultiTenantsWebpackPlugin(tenants, __dirname, path.dirname(__dirname));

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
  }
];
const scssPipeline = [
  require.resolve('sass-loader'),
];

const config = {
  entry: { browser: path.resolve("./browser.tsx")},
  output: {
    clean: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      title: '@example App',
      template: path.resolve('./index.html'),
      filename: 'index.html'
    }),
    multiTenantsWebpackPlugin,
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '...'],
  },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      ...multiTenantsWebpackPlugin.getAssetRules({
        svg: svgPipeline,
        css: scssPipeline,
      }),
      {
        test: /[jt]sx?$/,
        use: [
          require.resolve("swc-loader")
        ],
      },
    ],
  },
};

module.exports = config;
