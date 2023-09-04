const path = require('node:path');

const getTenantOptions = () => ({
  appDir: path.dirname(require.resolve('@example/app/package.json')),
  assetDir: 'assets',
  maxInlineSize: 1024 * 3,
  tenants: {
    base: [],
    dark: [path.dirname(require.resolve('@example/tenant-dark/package.json'))],
    light: [path.dirname(require.resolve('@example/tenant-light/package.json'))],
  },
});

module.exports = getTenantOptions;
