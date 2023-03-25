import { LoaderDefinition } from 'webpack';

import postcss from 'postcss';
import localByDefault from "postcss-modules-local-by-default";
import modulesScope from "postcss-modules-scope";

import postcssExport from '../utils/postcssExport';
import overload, {SearchCallback} from '../utils/overload';
import { TenantOptions} from "../types";

interface DataContext {
  count: number;
}
const cssLoader: LoaderDefinition<TenantOptions, DataContext> = function (rawSource) {
  const callback = this.async();
  const options = this.getOptions();
  const { count } = this.data;
  const moduleMap = {};

  postcss([
    localByDefault(),
    modulesScope(),
    postcssExport(moduleMap)
  ])
    .process(rawSource.toString(), { from: this.resourcePath })
    .then(({ messages }) => {
    if (messages.length) {
      this.getLogger().log(...messages);
    }
    const classNames = encodeURIComponent(JSON.stringify(moduleMap));
    const search: SearchCallback = (tenantName) => `?${new URLSearchParams({ classNames, tenant: tenantName }).toString()}`;

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
cssLoader.pitch = (remainingRequest, precedingRequest, data) => {
  (data as DataContext).count = counter;
  counter += 1;
};
module.exports = cssLoader;
