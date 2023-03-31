import { Compilation, RuleSetUseItem } from 'webpack';

export interface Tenant {
  tenantName: string;
  tenantDirs: string[];
}

export type UseOption = RuleSetUseItem[];

export interface TenantOptions {
  tenants: Tenant[];
  appDir: string;
  assetPath: string;
}

export interface ChunkHandler {
  compilation: Compilation;
  auxiliaryFiles: Set<string>;
  tenantName: string;
  id: string;
  assetPath: string;
}
