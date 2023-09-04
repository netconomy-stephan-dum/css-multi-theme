import { LoaderDefinition } from 'webpack';
import { TenantOptions } from '../types';
import { URLSearchParams } from 'node:url';
import { createHash } from 'node:crypto';

const getFilePath = (resourceQuery: string, assetDir: string, contentHash: string) => {
  const search = new URLSearchParams(resourceQuery);
  const dest = search.get('dest') || '';

  if (search.get('hash') !== 'false') {
    const segments = dest.split('.');
    const ext = segments.pop();
    const base = segments.pop();
    segments.push(`${base}_${contentHash}.${ext}`);

    return `${assetDir}/${segments.join('.')}`;
  }

  return `${assetDir}/${dest}`;
};
const tenantEmitterLoader: LoaderDefinition<TenantOptions> = function tenantEmitterLoader(
  rawSource,
) {
  const source = rawSource.toString();
  const contentHash = createHash('sha256').update(source).digest('hex').toString();
  const { assetDir } = this.getOptions();
  const filePath = getFilePath(this.resourceQuery, assetDir, contentHash);
  this.emitFile(filePath, source);
  return `/* ${contentHash} */ const filePath = '${filePath}'; export default filePath;`;
};

export default tenantEmitterLoader;
