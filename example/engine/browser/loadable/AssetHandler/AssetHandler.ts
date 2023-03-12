import createAsset from './createAssets';

interface ActiveAsset {
  usage: number;
  node: HTMLElement;
  promise: Promise<void>;
}

const AssetHandler = () => {
  const activeAssets: Record<string, ActiveAsset> = {};

  const removeAssets = (assets: string[]) => {
    assets.forEach((rawAsset) => {
      const asset = activeAssets[rawAsset];
      asset.usage -= 1;

      if (asset.usage === 0) {
        delete activeAssets[rawAsset];
        document.head.removeChild(asset.node);
      }
    });
  };

  const loadAssets = (assets: string[]) => {
    return Promise.all(
      assets.map((rawAsset) => {
        if (!(rawAsset in activeAssets)) {
          const assetNode = createAsset(rawAsset);
          if (!assetNode) {
            return null;
          }
          const promise = new Promise((resolve) => {
            assetNode.onload = resolve;
          }).then(() => {
          });

          document.head.appendChild(assetNode);
          activeAssets[rawAsset] = {
            usage: 0,
            node: assetNode,
            promise,
          }
        }

        const asset = activeAssets[rawAsset];
        asset.usage += 1;

        return asset.promise;
      })
    );
  };

  return { removeAssets, loadAssets };
};

export default AssetHandler;
