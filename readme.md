# multi-tenant-plugin

The plugin emits individual *css* and *svg* assets for each added tenant in the same build.

Only use this plugin if an overload for every file is really needed. Most style systems for theming should rely on css --custom-properties instead!

## key features
- reduce resources needed to build all tenants
- the app can serve all tenants which makes autoscaling easier
- enforce tenants to apply to the provided css module interface

## Example
A complete example is located in [./packages/example](./packages/example).

First you need to define all tenants the build should include.
All directories inside tenant dirs will be used from left to right to find a match overload.
If no overload is found the original base version is used.
````js

const MultiTenantsWebpackPlugin = require("multi-tenant-plugin");

const tenantOptions = {
  appDir: path.dirname(require.resolve('@example/app/package.json')),
  assetDir: 'assets',
  maxInlineSize: 1024 * 3,
  server: false,
  tenants: ['base', 'dark', 'light'],
};


const multiTenantsPlugin = new MultiTenantsWebpackPlugin(tenantOptions);

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

const webpackConfig = {
  entry: {
    main: {
      import: './some/file.js',
      layer: 'root'
    }
  },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      ...multiTenantsPlugin.getAssetRules(
        {
            css: scssPipeline,
            svg: svgPipeline,
        },
        'root'
      )
    ],
  },
  plugins: [multiTenantsPlugin],
};

````

### example setup

add following domains to your host file
- base.localhost
- dark.localhost
- light.localhost

execute `yarn dev-webpack` to run all scripts and start the server

go to one of the addresses added to host file with appropriate PORT (default is 8080 for csr and 8114 for ssr).