import React, { useEffect } from 'react';
import loadableBase from '@loadable/component';
import assetHandler from './AssetHandler';

const getAssets = (chunkName: string) => {
  const { assetsByChunkName, tenantName } = window;

  return [
    ...(assetsByChunkName[chunkName] || []),
    ...(assetsByChunkName[`${tenantName}-${chunkName}`] || []),
  ];
};

const loadable = (options: unknown, chunkName: string) => {
  // this happens at buildTime
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const Component = loadableBase(options, chunkName);
  const InnerLoadable = () => {
    useEffect(() => {
      const assets = getAssets(chunkName);
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
