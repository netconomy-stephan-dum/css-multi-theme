import { LoaderDefinition } from 'webpack';
import postcss from 'postcss';
import localByDefault from 'postcss-modules-local-by-default';
import modulesScope from 'postcss-modules-scope';

import postcssExport from '../utils/postcssExport';
import { TenantOptions } from '../types';
import resolveToRelativeOverload from '../utils/resolveToRelativeOverload';

interface DataContext {
  order: number;
}

const cssLoader: LoaderDefinition<TenantOptions, DataContext> = function cssLoader(rawSource) {
  const callback = this.async();
  const options = this.getOptions();
  const { order } = this.data;
  const moduleMap = {};
  const source = rawSource.toString();
  postcss([localByDefault(), modulesScope(), postcssExport(moduleMap)])
    .process(source, { from: this.resourcePath })
    .then(async ({ messages }) => {
      if (messages.length) {
        this.getLogger().log(...messages);
      }
      const { appDir, tenants } = options;
      const { src, dest } = await resolveToRelativeOverload(this, options);
      const classNames = encodeURIComponent(JSON.stringify(moduleMap));

      return Promise.all(
        tenants.map((tenant) => {
          const { tenantDirs, tenantName } = tenant;

          const search = new URLSearchParams({
            classNames,
            dest: `${tenantName}/css/${order}/${dest}`.replace(/\.scss$/, `.css`),
            tenant: tenantName,
          }).toString();

          return this.getResolve({ modules: tenantDirs })(appDir, src)
            .catch(() => this.resourcePath)
            .then(
              (overloadPath) => `${this.utils.contextify(this.context, overloadPath)}?${search}`,
            );
        }),
      ).then((filePaths) => {
        const cssPaths = Array.from(new Set(filePaths));
        const imports = cssPaths.map((filePath) => `require('${filePath}').default`).join(',');
        callback(
          null,
          [
            `const imports = [${imports}];`,
            `const moduleMap = ${JSON.stringify(moduleMap)};`,
            `export default moduleMap;`,
          ].join('\n'),
        );
      });
    });
};

let loadOrder = 1;
const loadOrderByRequest = new Map();

cssLoader.pitch = function pitch(remainingRequest, precedingRequest, data) {
  const order = loadOrderByRequest.get(this.resource) || loadOrder;

  if (order === loadOrder) {
    loadOrderByRequest.set(this.resource, order);
    loadOrder += 1;
  }

  Object.assign(data, {
    order,
  });
};

module.exports = cssLoader;
