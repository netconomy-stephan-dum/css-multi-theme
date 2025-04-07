import path from 'node:path';
import { createRequire } from 'node:module';

const {  resolve } = createRequire(import.meta.url);
const getTenantOptions = (server = false) => ({
  appDir: path.dirname(resolve('@example/app/package.json')),
  assetDir: 'assets',
  maxInlineSize: 1024 * 3,
  server,
  tenants: ['base', 'dark', 'light'],
});

export default getTenantOptions;
