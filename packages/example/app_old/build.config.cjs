const path = require('node:path');

const buildConfig = {
  appDir: __dirname,
  assetDir: 'assets',
  entries: {
    browser: require.resolve('@example/engine-browser'),
    server: require.resolve('@example/engine-server'),
    universal: require.resolve('@example/universal'),
  },
  tenants: {
    base: [],
    dark: path.dirname(require.resolve('@example/tenant-dark/package.json')),
    light: [path.dirname(require.resolve('@example/tenant-light/package.json'))],
  },
};

module.exports = buildConfig;
