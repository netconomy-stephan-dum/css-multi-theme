import { createContext } from 'react';

interface IConfigContext {
  tenantName: string;
  assetsByChunkName: Record<string, string[]>;
  port: number;
}

const ConfigContext = createContext<IConfigContext>({
  assetsByChunkName: {},
  port: 8114,
  tenantName: 'base',
});

export default ConfigContext;
