import { ComponentPropsWithRef, ComponentType, FunctionComponent, lazy } from "react";
import { ImportHandler } from "../createBrowserEngine";

const loadable = <T extends ComponentType<object>>(importHandler: ImportHandler<T>, chunkName: string): FunctionComponent<ComponentPropsWithRef<T>> => {
  const patchedHandler = () => {
    const { assetsByChunkName, assetHandler, tenantName } = window;

    const assets = [
      ...(assetsByChunkName[chunkName] || []),
      ...(assetsByChunkName[`${tenantName}-${chunkName}`] || [])
    ];

    // TODO: unload
    return Promise.all([
      importHandler(),
      assetHandler.loadAssets(assets),
    ]).then(([ComponentESExport]) => (ComponentESExport));
  };

  return lazy(patchedHandler);
};

export default loadable;
