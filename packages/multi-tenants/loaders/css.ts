import { LoaderDefinition } from 'webpack';
import postcss from 'postcss';
import localByDefault from 'postcss-modules-local-by-default';
import modulesScope from 'postcss-modules-scope';

import postcssExport from '../utils/postcssExport';
import { TenantOptions } from '../types';
import path from 'node:path';
import resolveTenants from './utils/resolveTenants';
import handleImports from './utils/handleImports';

interface DataContext {
  order: number;
}

const cssLoader: LoaderDefinition<TenantOptions, DataContext> = function cssLoader(rawSource) {
  const callback = this.async();
  const options = this.getOptions();
  const moduleMap = {};
  const source = rawSource.toString();

  // console.log('--->', source, '<--');

  postcss([localByDefault(), modulesScope(), postcssExport(moduleMap)])
    .process(source, { from: this.resourcePath })
    .then(({ messages }) => {
      if (messages.length) {
        this.getLogger().log(...messages);
      }

      const { server } = options;
      const classNames = encodeURIComponent(JSON.stringify(moduleMap));

      resolveTenants(
        this,
        (tenantName: string) =>
          `?${new URLSearchParams({
            classNames,
            dest: `${tenantName}/css/${path
              .relative(process.cwd(), this.resourcePath)
              .replace(/\\/g, '/')}`.replace(/\.scss$/, `.css`),
            tenant: tenantName,
          }).toString()}`,
      ).then((filePaths) => {
        callback(
          null,
          [
            handleImports(filePaths, server),
            `const moduleMap = ${JSON.stringify(moduleMap)};`,
            `export default moduleMap;`,
          ]
            .filter(Boolean)
            .join('\n'),
        );
      });
    });
};

module.exports = cssLoader;
