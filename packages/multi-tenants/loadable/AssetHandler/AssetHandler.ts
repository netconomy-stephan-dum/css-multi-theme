import createAsset from './createAssets';

interface ActiveAsset {
  usage: number;
  node: HTMLElement;
  promise: Promise<void>;
}

const activeAssets: Record<string, ActiveAsset> = {};

const removeAssets = (assets: string[]) => {
  assets.forEach((rawAsset) => {
    const asset = activeAssets[rawAsset];
    if (asset) {
      asset.usage -= 1;

      if (asset.usage === 0) {
        delete activeAssets[rawAsset];
        document.head.removeChild(asset.node);
      }
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
          // eslint-disable-next-line no-undefined
        }).then(() => undefined);

        document.head.appendChild(assetNode);
        activeAssets[rawAsset] = {
          node: assetNode,
          promise,
          usage: 0,
        };
      }

      const asset = activeAssets[rawAsset];
      asset.usage += 1;

      return asset.promise;
    }),
  );
};
const assetHandler = { loadAssets, removeAssets };

export default assetHandler;
