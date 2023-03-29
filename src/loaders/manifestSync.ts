import { readFile, access } from 'node:fs/promises';
import crypto from 'node:crypto';
import { LoaderDefinition } from 'webpack';
import { TenantOptions } from '../types';

const fileExists = (filePath: string) =>
  access(filePath).then(
    () => true,
    () => false,
  );
const manifestSyncLoader: LoaderDefinition<TenantOptions> = function manifestSyncLoader() {
  const { appDir, tenants, assetPath } = this.getOptions();
  const manifestByTenant: Record<string, string> = {};
  return Promise.all(
    tenants.map(({ tenantName }) => {
      const publicPath = `/${assetPath}/${tenantName}/assetsByChunkName.js`;
      const assetByChunkNamePath = `${appDir}/dist${publicPath}`;
      manifestByTenant[tenantName] = publicPath;

      return fileExists(assetByChunkNamePath)
        .then((exists) => {
          if (exists) {
            this.addBuildDependency(assetByChunkNamePath);
            return readFile(assetByChunkNamePath, { encoding: 'utf-8' });
          }
          this.addMissingDependency(assetByChunkNamePath);
          return '';
        })
        .then((fileContent) => crypto.createHash('sha256').update(fileContent).digest('hex'));
    }),
  ).then((hashes) => {
    return [
      `const manifestByTenant = ${JSON.stringify(manifestByTenant)};`,
      `export const hashes = ${JSON.stringify(hashes.toString())};`,
      `export default manifestByTenant;`,
    ].join('\n');
  });
};

export default manifestSyncLoader;
