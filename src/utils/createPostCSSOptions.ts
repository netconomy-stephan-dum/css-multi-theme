import {TenantOptions} from "../types";

import { URLSearchParams } from "node:url";
import {DEFAULT_TENANT} from "../MultiTenantsWebpackPlugin";
import path from 'node:path';
import localByDefault from "postcss-modules-local-by-default";
import modulesScope from "postcss-modules-scope";
import postcssURL from 'postcss-url';

import {LoaderContext} from "webpack";
import postcssExport from './postcssExport';
import resolveToRelativeOverload from './resolveToRelativeOverload';

const createPostCSSOptions = (options: TenantOptions) => (context: LoaderContext<TenantOptions>) => {
  // TODO: use context.query instead
  const search = new URLSearchParams(context.resourceQuery);
  const searchTenantName = search.get('tenant');
  const rawClassNames = search.get('classNames');

  if (!rawClassNames) {
    throw new Error(`Classnames query string not set for post css loader`);
  }
  const classNames = JSON.parse(decodeURIComponent(rawClassNames));

  const tenant = options.tenants.find(({ tenantName }) => tenantName === searchTenantName) || DEFAULT_TENANT;

  const { tenantDirs, tenantName } = tenant;
  const { src } = resolveToRelativeOverload(context, options);
  const relativeReducePath = path.dirname(src);
  const resolveRequest = context.getResolve({ modules: tenantDirs });

  return ({
    plugins: [
      localByDefault(),
      modulesScope({
        generateScopedName(localName: string) {
          const className = classNames[localName];

          if (className) {
            return className;
          }

          throw new Error(`Classname '${localName}' did not match any selector. Possible Selectors:\n\t${Object.keys(classNames).join('\n\t')}`)
        },
      }),
      postcssExport(),
      postcssURL({
        url: (asset) =>
          // TODO: check what happens if asset.url is an absolute path
          resolveRequest(options.appDir, `${relativeReducePath  }/${  asset.url}`)
            .catch(() => path.join(path.dirname(context.resourcePath), asset.url))
            .then((overloadPath) => new Promise((resolve, reject) => {
              context.loadModule(`${overloadPath  }?tenant=${tenantName}`, (error, source) => {
                if (error) {
                  return reject(error);
                }
                return resolve(source.toString());
              })
            }))
      }),
    ],
  })
}

export default createPostCSSOptions;
