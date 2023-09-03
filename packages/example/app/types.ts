import { FunctionComponent } from 'react';

export interface Route {
  Component: FunctionComponent;
  reg: RegExp;
}



export type AssetsByChunkName = Record<string, string[]>;
