import React, { useContext, useEffect } from 'react';
import loadableBase from '@loadable/component';
import assetHandler from './AssetHandler';
import ConfigContext from '@example/app/ConfigContext';

const loadable = (options: unknown) => {
  // the props are changed at buildTime
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const chunkName = options.chunkName();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

    return <Component />;
  };

  return () => <InnerLoadable />;
};
export default loadable;
