import React, { useContext, useEffect } from 'react';
import loadableBase from '@loadable/component';
import assetHandler from './AssetHandler';
import ConfigContext from '@example/app/ConfigContext';

const loadable = (options: unknown) => {
  // @ts-expect-error options are changed a build time
  const chunkName = options.chunkName();
  // @ts-expect-error options are changed at build time
  const Component = loadableBase(options);
  const InnerLoadable = () => {
    const { assetsByChunkName, tenantName } = useContext(ConfigContext);

    useEffect(() => {
      const assets = [
        ...(assetsByChunkName[chunkName] || []),
        ...(assetsByChunkName[`${tenantName}-${chunkName}`] || []),
      ];
      assetHandler.loadAssets(assets);
      return () => {
        assetHandler.removeAssets(assets);
      };
    });

    // @ts-expect-error setup at build time
    return <Component />;
  };

  return () => <InnerLoadable />;
};
export default loadable;
