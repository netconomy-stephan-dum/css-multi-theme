const path = require('node:path');

const getTenantOptions = (server = false) => ({
  appDir: path.dirname(require.resolve('@example/app/package.json')),
  assetDir: 'assets',
  maxInlineSize: 1024 * 3,
  server,
  tenants: ['dark', 'light'],
});

module.exports = getTenantOptions;
