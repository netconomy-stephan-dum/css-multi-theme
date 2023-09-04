type ManifestByTenant = Record<string, string>;

declare var __manifestByTenant__: ManifestByTenant;

export const hashes: string[] = [];
// will be replaced at build time with assetsByTenants
export default __manifestByTenant__;
