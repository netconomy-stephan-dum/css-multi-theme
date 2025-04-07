import webpack from 'webpack';

export type UseOption = webpack.RuleSetUseItem[];

export interface TenantOptions {
  maxInlineSize: number;
  tenants: string[];
  appDir: string;
  assetDir: string;
  server: boolean;
}

export interface ChunkHandler {
  compilation: webpack.Compilation;
  auxiliaryFiles: Set<string>;
  tenantName: string;
  id: string;
  assetDir: string;
}
