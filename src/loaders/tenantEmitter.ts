import { LoaderDefinition } from 'webpack';
import { TenantOptions } from '../types';
import { URLSearchParams } from 'node:url';

const tenantEmitterLoader: LoaderDefinition<TenantOptions> = function tenantEmitterLoader(
  rawSource,
) {
  const source = rawSource.toString();
  const hash = this.utils.createHash('sha256');
  const contentHash = hash.update(source).digest('hex');
  // TODO: use context.query instead
  const search = new URLSearchParams(this.resourceQuery);
  const tenantName = search.get('tenant');
  const order = search.get('order');
  const dest = search.get('dest');
  const filePath = `${`${tenantName}/${order}/${dest}`.replace(/\.scss$/, `_${contentHash}.css`)}`;
  this.emitFile(filePath, source);
  return `const filePath = '/${filePath}'; export default filePath;`;
};

export default tenantEmitterLoader;
