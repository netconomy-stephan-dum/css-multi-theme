import { ComponentPropsWithRef, ComponentType, FunctionComponent, lazy } from "react";
type ImportHandler<T> = () => Promise<{ default: T }>;

export type AssetsByChunkName = Record<string, string[]>;

const createChunk = <T extends ComponentType<any>>(importHandler: ImportHandler<T>, chunkName: string): FunctionComponent<ComponentPropsWithRef<T>> => {
  const patchedHandler = () => {
    const componentPromise = importHandler();

    // @ts-ignore
    const { assetsByChunkName, assetHandler } = window;
    const assets = assetsByChunkName[chunkName];

    return Promise.all([
      componentPromise,
      assetHandler.loadAssets(assets),
    ]).then(([ComponentESExport]) => ComponentESExport);
  };

  return lazy(patchedHandler);
};

export default createChunk;
