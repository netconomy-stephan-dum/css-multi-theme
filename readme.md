# multi-tenants-webpack-plugin

The plugin emits individual *css* and *svg* assets for each added tenant in the same build.

Only use this plugin if an overload for every file is really needed. Most style systems for theming should rely on css --custom-properties instead!

## key features
- reduce resources needed to build all tenants
- the app can serve all tenants which makes autoscaling easier
- enforce tenants to apply to the provided css module interface

## Example
A complete example is located in [./example](./example) with the main entry in [./example/app](./example/app).

First you need to define all tenants the build should include.
All directories inside tenantDirs will be used from left to right to find a match overload.
If no overload is found the original base version is used.
````js

const MultiTenantsWebpackPlugin = require("multi-tenants-webpack-plugin");

/* this is the app only with default styles applied */
const baseTenant = {
  tenantName: 'base',
  tenantDirs: [],
};

const lightTenant = {
  tenantName: 'light',
  tenantDirs: [
    path.dirname(require.resolve('@example/tenant-light/package.json'))
  ],
};

const darkTenant = {
  tenantName: 'dark',
  tenantDirs: [
    path.dirname(require.resolve('@example/tenant-dark/package.json'))
  ]
};

const tenants = [darkTenant, lightTenant, baseTenant];

const multiTenantsPlugin = new MultiTenantsWebpackPlugin(__dirname, 'assets', tenants);

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
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      ...multiTenantsPlugin.getAssetRules({
        css: scssPipeline,
        svg: svgPipeline,
      })
    ],
  },
  plugins: [multiTenantsPlugin],
};

````

## example

add following domains to your host file
- base.localhost
- dark.localhost
- light.localhost

execute `yarn start` to run all scripts and start the server

go to one of the addresses added to host file with approriate PORT (default is 8080)

## Roadmap:
- add eslint & stylelint
- add static dir overload to plugin
- hmr for scss
- sprite also for svg inside css url
- rework options
  - split css in pre and post step
  - css post css plugins as options
  - add inline loader maxFileSize as option
  - add custom spriteStringToObject 
- inline loader add resolve with all possible image extensions to loader load ie svg with jpg
- prepare package.json for release

## v2
- use a javascript parser as starting point to avoid loading the file and not using it
- make tenant optional optimize svg/css support for no tenant
- optimize sprites by use an inline webpack build to detect how to distribute them
  - the plugin can descide if inline makes sense ie if the distributed item is too small for a separate sprite
- allow splitting into two process: 
  1. only do the js => write classNames to on big file
  2. only do the assets => imports asset file