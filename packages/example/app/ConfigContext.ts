import { createContext } from 'react';

interface IConfigContext {
  tenantName: string;
  assetsByChunkName: Record<string, string[]>;
}

const ConfigContext = createContext<IConfigContext>({
  assetsByChunkName: {},
  tenantName: 'base',
});

export default ConfigContext;
