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
/* this is the app only with default styles applied */
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
````


````js

const MultiTenantsWebpackPlugin = require("multi-tenants-webpack-plugin");

````

## example

add following domains to your host file
- base.localhost
- dark.localhost
- light.localhost

execute `yarn start` to run all scripts and start the server

go to one of the addresses added to host file with approriate PORT (default is 8080)
