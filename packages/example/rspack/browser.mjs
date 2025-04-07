import getCommonConfig from './common.mjs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import {HtmlRspackPlugin} from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import MultiTenantsPlugin from 'multi-tenants';
import getTenantOptions from './getTenantOptions.mjs';

const {  resolve } = createRequire(import.meta.url);
const multiTenantPlugin = new MultiTenantsPlugin.default(getTenantOptions(false))

const getBrowserConfig = async (env, options) => {
  const isProduction = env.RSPACK_BUILD;

  const commonConfig = await getCommonConfig(env, { ...options, target: 'web' });

  const config =  Object.assign(commonConfig, {
    name: 'browser',
    output: {
      path: join(process.cwd(), 'dist/public'),
      publicPath: '/',
    },
    entry: {
      main: {
        import: resolve('@example/runtime-browser'),
        layer: 'root',
      },
    },
    module: {
      rules: [
        ...multiTenantPlugin.getAssetRules(),
        ...commonConfig.module.rules
      ],
    }
  });

  config.plugins = [
    ...config.plugins,
    multiTenantPlugin,
    !isProduction && new ReactRefreshPlugin({ overlay: false }),
    new HtmlRspackPlugin({
      template: resolve('./index.html'),
    }),
  ].filter(Boolean);

  return config;
};

export default getBrowserConfig;
