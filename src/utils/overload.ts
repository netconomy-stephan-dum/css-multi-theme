import resolveToRelativeOverload from './resolveToRelativeOverload';
import {LoaderContext} from "webpack";
import {TenantOptions} from "../types";

export type EachCallback = (tenantName: string, targetFile: string, source: string) => void;
export type SearchCallback = (tenantName: string) => string;
const overload = (context: LoaderContext<TenantOptions>, options: TenantOptions, each: EachCallback = () => {}, search: SearchCallback = () => '') => {
  const { appDir, tenants } = options;
  const { src, dest } = resolveToRelativeOverload(context, options);

  return Promise.all(
    tenants.map(({ tenantDirs, tenantName }) => context.getResolve({ modules: tenantDirs })(appDir, src)
      .catch(() => context.resourcePath)
      .then((overloadPath) => new Promise((resolve, reject) => {
        context.loadModule(overloadPath + search(tenantName), (error, source) => {
          if (error) {
            return reject(error);
          }
          each(tenantName, dest, source.toString());
          return resolve(null);
        });
      }))
  ))
}

export default overload;
