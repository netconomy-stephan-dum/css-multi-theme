import path from 'node:path';
import commonRSPackConfig from './common.mjs';
import nodeExternals from 'webpack-node-externals';
import { createRequire } from 'node:module';
import getTenantOptions from '@example/webpack/getTenantOptions.js';
import MultiTenantsPlugin from 'multi-tenants';

const multiTenantPlugin = new MultiTenantsPlugin.default(getTenantOptions(true));

const {  resolve } = createRequire(import.meta.url);

const serverRSPackConfig = async (env, options) => {
  const commonConfig = await commonRSPackConfig(env, { ...options, target: 'node' });

  const config = Object.assign(commonConfig, {
    target: 'node',
    entry: {
      server: {
        import: resolve('@example/runtime-server'),
        layer: 'root'
      },
    },
    externals: [
      // nodeExternals({
      //   modulesDir: '../../../node_modules',
      //   // allowlist: ['webpack/hot/poll?100'],
      // }),
    ],
    externalsPresets: {
      node: true,
    },
    module: {
      rules: [...commonConfig.module.rules, ...multiTenantPlugin.getAssetRules()]
    },
    plugins: [
      ...commonConfig.plugins, multiTenantPlugin
    ],
    externalsType: 'commonjs',
    name: 'server',
    output: {
      filename: './[name].js',
      path: path.join(process.cwd(), 'dist/private'),
    },
  });

  return config;
}

export default serverRSPackConfig;
