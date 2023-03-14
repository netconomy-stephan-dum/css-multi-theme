const postcss = require('postcss');
const localByDefault = require("postcss-modules-local-by-default");
const modulesScope = require("postcss-modules-scope");

const postcssExport = require('../utils/postcssExport');
const overload = require('../utils/overload');

const cssLoader = function (rawSource) {
  const callback = this.async();
  const options = this.getOptions();
  const { count } = this.data;
  const { appDir, tenants } = options;

  const moduleMap = {};

  postcss([
    localByDefault(),
    modulesScope(),
    postcssExport(moduleMap)
  ]).process(rawSource.toString(), { from: this.resourcePath }).then(({ messages }) => {
    if (messages.length) {
      console.log(...messages);
    }
    const classNames = encodeURIComponent(JSON.stringify(moduleMap));
    const search = (tenantName) => `?${new URLSearchParams({classNames, tenant: tenantName}).toString()}`;

    return overload(this, options, (tenantName, targetFile, source) => {
      this.emitFile(`${tenantName}/${count}/${targetFile}`, source);
    }, search).then(() => {
      callback(null, [
        `const moduleMap = ${JSON.stringify(moduleMap)};`,
        `export default moduleMap;`
      ].join('\n'))
    }, callback);
  });
};

let counter = 0;
cssLoader.pitch = function (remainingRequest, precedingRequest, data) {
  data.count = counter++;
};
module.exports = cssLoader;
