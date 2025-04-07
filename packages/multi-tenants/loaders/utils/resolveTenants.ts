import { TenantOptions } from '../../types';
import resolveTenantOverload from './resolveTenantOverload';

interface Loader<Options> {
  getOptions: () => Options;
  resourcePath: string;
  context: string;
  utils: {
    contextify(context: string, filePath: string): string;
  };
}
type GetSearchQuery = (tenantName: string) => string;

const resolveTenants = (loader: Loader<TenantOptions>, getSearchQuery: GetSearchQuery) => {
  const { tenants } = loader.getOptions();
  return Promise.all(
    tenants.map((tenantName) =>
      resolveTenantOverload(loader.resourcePath, tenantName).then((overloadPath) => {
        const loaderSegments = loader.utils.contextify(loader.context, overloadPath).split('!');
        loaderSegments[0] = `${loaderSegments[0]}${getSearchQuery(tenantName)}`;
        return loaderSegments.join('!');
      }),
    ),
  );
};

export default resolveTenants;
