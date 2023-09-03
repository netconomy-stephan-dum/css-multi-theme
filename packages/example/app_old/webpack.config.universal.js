const path = require('node:path');
// const path = require('node:path');
const getBaseConfig = require('@example/webpack/base');
// const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const RunAfterEmitPlugin = require('@example/webpack/RunAfterEmitPlugin');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const MultiTenantsWebpackPlugin = require('multi-tenants').default;

const dist = 'dist';
const base = process.cwd();
const svgPipeline = [
  {
    loader: require.resolve('svgo-loader'),
    options: {
      plugins: ['removeTitle', 'removeDesc', 'removeXMLNS', 'minifyStyles'],
    },
  },
];

//
// const baseTenant = {
//   tenantDirs: [],
//   tenantName: 'base',
// };
//
// const lightTenant = {
//   tenantDirs: [path.dirname(require.resolve('@example/tenant-light/package.json'))],
//   tenantName: 'light',
// };
//
// const darkTenant = {
//   tenantDirs: [path.dirname(require.resolve('@example/tenant-dark/package.json'))],
//   tenantName: 'dark',
// };
//
// const tenants = [darkTenant, lightTenant, baseTenant];

// const multiTenantsWebpackPlugin = new MultiTenantsWebpackPlugin(__dirname, 'assets', tenants);

const scssPipeline = [require.resolve('sass-loader')];

const universalConfig = async (env, options) => {
  const { appDir, assetDir, tenants, entries } = require(`${process.cwd()}/build.config.cjs`);
  const multiTenantsWebpackPlugin = new MultiTenantsWebpackPlugin(appDir, assetDir, tenants);
  const nodeConfig = {
    entry: {
      universal: [`${require.resolve('webpack/hot/poll')}?100`, entries.universal],
    },
    externalsPresets: { web: false, webAsync: true },
    // externalsPresets: { node: true },
    // externalsType: 'commonjs',
    name: 'universal',
    output: {
      chunkFormat: 'array-push',
      filename: './[name].js',
      path: path.join(base, dist, 'public'),
    },
    target: 'web',
  };
  const umdConfig = {
    entry: {
      // universal: entries.universal,
      universal: [`${require.resolve('webpack/hot/poll')}?500`, entries.universal],
      // universal: [`${require.resolve('webpack/hot/dev-server')}`, entries.universal],
    },
    name: 'universal',
    output: {
      // chunkFormat: 'array-push',
      chunkLoading: false,
      filename: './[name].js',
      globalObject: '(typeof window !== "undefined" ? self : {})',
      library: {
        export: 'default',
        name: 'universalChunk',
        type: 'umd',
      },
      path: path.join(base, dist, 'public'),
      publicPath: '/',
    },
    target: 'es5',
  };

  // const moduleConfig = {
  //   entry: {
  //     universal: entries.universal,
  //     // universal: [`${require.resolve('webpack/hot/signal')}?100`, entries.universal],
  //   },
  //   experiments: {
  //     outputModule: true,
  //   },
  //   externalsType: 'module',
  //   name: 'universal',
  //   output: {
  //     chunkFormat: 'module',
  //     environment: {
  //       module: true,
  //     },
  //     filename: './[name].mjs',
  //     library: {
  //       type: 'module',
  //     },
  //     module: true,
  //     path: path.join(base, dist, 'public'),
  //     publicPath: '/',
  //   },
  //   target: 'es2020',
  // };
  const config = Object.assign(await getBaseConfig(env, options), nodeConfig);

  // config.module.rules.push(
  //   ...multiTenantsWebpackPlugin.getAssetRules({
  //     css: scssPipeline,
  //     svg: svgPipeline,
  //   }),
  // );

  config.plugins.push(
    new RunScriptWebpackPlugin({
      autoRestart: false,
      name: './universal.js',
      // nodeArgs: ['--inspect'],
    }),
    // new RunAfterEmitPlugin({
    //   // autoRestart: false,
    //   entry: 'universal',
    //   nodeArgs: ['--inspect'],
    // }),
    // multiTenantsWebpackPlugin,
  );
  console.log(config);
  return config;
};

module.exports = universalConfig;
