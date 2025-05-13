import { TenantOptions } from '../types';

const getAssetSyncRule = (options: TenantOptions) => ({
  // only apply if manifest from @multi-tenant-plugin/manifest.json was imported
  // include: [path.dirname(__dirname)],
  test: /manifestByTenant\.ts$/,
  type: 'javascript/auto',
  use: [
    require.resolve('../loaders/hmr'),
    {
      loader: require.resolve('../loaders/manifestSync'),
      options,
    },
  ],
});

export default getAssetSyncRule;
