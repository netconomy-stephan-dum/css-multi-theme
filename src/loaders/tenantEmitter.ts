import { LoaderDefinition } from 'webpack';
import { TenantOptions } from '../types';
import { URLSearchParams } from 'node:url';

const tenantEmitterLoader: LoaderDefinition<TenantOptions> = function tenantEmitterLoader(
  rawSource,
) {
  const source = rawSource.toString();
  const { assetPath } = this.getOptions();
  const contentHash = this.utils.createHash('sha256').update(source).digest('hex').toString();
  // TODO: use context.query instead
  const dest = new URLSearchParams(this.resourceQuery).get('dest') as string;

  const segments = dest.split('.');
  const ext = segments.pop();
  const base = segments.pop();
  segments.push(`${base}_${contentHash}.${ext}`);

  const filePath = `${assetPath}/${segments.join('.')}`;
  this.emitFile(filePath, source);
  return `const filePath = '/${filePath}'; export default filePath;`;
};

export default tenantEmitterLoader;
