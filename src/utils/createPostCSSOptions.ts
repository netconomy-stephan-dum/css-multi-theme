import { URLSearchParams } from 'node:url';
import path from 'node:path';
import localByDefault from 'postcss-modules-local-by-default';
import modulesScope from 'postcss-modules-scope';
import postcssURL from 'postcss-url';
import { LoaderContext } from 'webpack';
import { TenantOptions } from '../types';
import postcssExport from './postcssExport';
import resolveToRelativeOverload from './resolveToRelativeOverload';

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
const createPostCSSOptions =
  (options: TenantOptions) => (context: LoaderContext<TenantOptions>) => {
    // TODO: use context.query instead
    const search = new URLSearchParams(context.resourceQuery);
    const searchTenantName = search.get('tenant');
    const tenant = options.tenants.find(({ tenantName }) => tenantName === searchTenantName);

    if (!tenant) {
      throw new Error(`Could not find any tenant with name ${searchTenantName}`);
    }

    const { tenantDirs, tenantName } = tenant;

    return {
      plugins: [
        localByDefault(),
        getModulesScope(context),
        postcssExport(),
        postcssURL({
          url: async (asset) => {
            const { src } = await resolveToRelativeOverload(context, options);
            const relativeReducePath = path.dirname(src);
            const resolveRequest = context.getResolve({ modules: tenantDirs });
            // TODO: check what happens if asset.url is an absolute path
            return resolveRequest(options.appDir, `${relativeReducePath}/${asset.url}`)
              .catch(() => path.join(path.dirname(context.resourcePath), asset.url))
              .then(
                (overloadPath) =>
                  new Promise((resolve, reject) => {
                    context.loadModule(`${overloadPath}?tenant=${tenantName}`, (error, source) => {
                      if (error) {
                        return reject(error);
                      }
                      return resolve(source.toString());
                    });
                  }),
              );
          },
        }),
      ],
    };
  };

export default createPostCSSOptions;
