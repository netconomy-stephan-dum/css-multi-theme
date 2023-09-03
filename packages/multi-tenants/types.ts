import webpack from 'webpack';

export type UseOption = webpack.RuleSetUseItem[];

export interface TenantOptions {
  maxInlineSize: number;
  tenants: Record<string, string[]>;
  appDir: string;
  assetDir: string;
}

export interface ChunkHandler {
  compilation: webpack.Compilation;
  auxiliaryFiles: Set<string>;
  tenantName: string;
  id: string;
  assetDir: string;
}
