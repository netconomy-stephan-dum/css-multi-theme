import assetsByTenant from './manifestByTenant';
import assetHandler from './loadable/AssetHandler';

const prepareAssetsByChunkName = async (tenantName: string, port: number) => {
  const configContext = {
    assetsByChunkName: {
      main: [],
    },
    port,
    tenantName,
  };

  const updateAssetsByTenant = async () => {
    configContext.assetsByChunkName = (
      await import(/* webpackIgnore: true */ assetsByTenant[tenantName])
    ).default;
  };

  if (module.hot) {
    module.hot.accept();
    module.hot.accept('multi-tenants/manifestByTenant', () => {
      return updateAssetsByTenant();
    });
  }

  await updateAssetsByTenant();

  if (!document.getElementById('__LOADABLE_REQUIRED_CHUNKS__')) {
    await assetHandler.loadAssets(configContext.assetsByChunkName.main);
  }

  return configContext;
};

export default prepareAssetsByChunkName;
