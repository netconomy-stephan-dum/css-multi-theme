import {RuleSetUseItem} from "webpack";

export interface Tenant {
  tenantName: string;
  tenantDirs: string[];
  assetDir: string;
}


export type UseOption = RuleSetUseItem[];

export interface TenantOptions { tenants: Tenant[], appDir: string }