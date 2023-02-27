import { createRoot } from "react-dom/client";
import React, { ElementType } from "react";
import { AssetsByChunkName } from "@micro/utils/createChunk";

type Engine = (options: { assetsByChunkName: AssetsByChunkName, Component: ElementType, root?: string }) => void;

const engine: Engine = ({ assetsByChunkName, Component, root = 'body' }) => {
  const domElement = document.querySelector(root);

  if (domElement) {
    const rootElement = createRoot(domElement); // createRoot(container!) if you use TypeScript
    rootElement.render(<Component assetsByChunkName={assetsByChunkName}/>);
  }
};

export default engine;
