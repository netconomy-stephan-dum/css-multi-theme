import { LoaderContext } from 'webpack';
import { TenantOptions } from '../types';
import { URLSearchParams } from 'node:url';
import modulesScope from 'postcss-modules-scope';

const getModulesScope = (context: LoaderContext<TenantOptions>) => {
  const search = new URLSearchParams(context.resourceQuery);
  const rawClassNames = search.get('classNames');

  if (!rawClassNames) {
    throw new Error(`Classnames query string not set for post css loader`);
  }
  const classNames = JSON.parse(decodeURIComponent(rawClassNames));

  return modulesScope({
    generateScopedName: (localName: string) => {
      const className = classNames[localName];

      if (className) {
        return className;
      }

      throw new Error(
        `Classname '${localName}' did not match any selector. Possible Selectors:\n\t${Object.keys(
          classNames,
        ).join('\n\t')}`,
      );
    },
  });
};

export default getModulesScope;
