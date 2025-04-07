import path from 'node:path';
import postcssURL from 'postcss-url';
import { readFile } from 'node:fs/promises';
import { LoaderContext } from 'webpack';
import { TenantOptions } from '../types';
import { createHash } from 'node:crypto';
import resolveTenantOverload from '../loaders/utils/resolveTenantOverload';
const encode = (code: string) =>
  code
    .replace(/%/g, '%25')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/&/g, '%26')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/'/g, '%22')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const addXmlns = (code: string) => {
  if (code.indexOf('xmlns') === -1) {
    return code.replace(/<svg/g, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return code;
};

const DEFAULT_MAX_INLINE_SIZE = 1024 * 5;

const getPostcssURL = (context: LoaderContext<TenantOptions>, options: TenantOptions) => {
  const search = new URLSearchParams(context.resourceQuery);
  const searchTenantName = search.get('tenant');
  const tenantName = options.tenants.find((tenantKey) => tenantKey === searchTenantName);

  if (!tenantName) {
    throw new Error(`Could not find any tenant with name ${searchTenantName}`);
  }

  return postcssURL({
    url: (asset) => {
      return resolveTenantOverload(
        path.join(path.dirname(context.resourcePath), asset.url),
        tenantName,
      ).then((overloadPath) => {
        return new Promise((resolve, reject) => {
          context.addBuildDependency(overloadPath);
          if (asset.url.split('.').pop()?.split('?')[0] === 'svg') {
            readFile(overloadPath, 'utf-8').then((source) => {
              if (source.length > options.maxInlineSize || DEFAULT_MAX_INLINE_SIZE) {
                const iconName = path.basename(overloadPath, '.svg');
                const publicPath = `assets/${tenantName}/svg/${iconName}.svg`;
                context.emitFile(publicPath, source);
                const hash = createHash('sha256').update(source).digest('hex').slice(0, 8);
                resolve(`"__sprite_name__?${hash}#${iconName}"`);
              } else {
                resolve(`"data:image/svg+xml;charset=utf-8,${addXmlns(encode(source))}"`);
              }
            }, reject);
          } else {
            context.loadModule(`${overloadPath}?tenant=${tenantName}`, (error, source) => {
              if (error) {
                return reject(error);
              }
              if (source) {
                return resolve(source.toString());
              }

              return reject(new Error('source is undefined'));
            });
          }
        });
      });
    },
  });
};

export default getPostcssURL;
