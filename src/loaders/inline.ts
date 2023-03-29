import { URLSearchParams } from 'node:url';
import { LoaderDefinition } from 'webpack';
import path from 'node:path';

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

// TODO: check if a normal asset module can be used instead
const inlineLoader: LoaderDefinition<{ maxSize?: number }> = function inlineLoader(rawSource) {
  const source = rawSource.toString();
  const { maxSize = 1024 * 5 } = this.getOptions();

  // TODO: add sprite
  if (source.length > maxSize) {
    // TODO: use this.query instead
    const tenantName = new URLSearchParams(this.resourceQuery).get('tenant');
    const publicPath = `/assets/${tenantName}/${path.basename(this.resourcePath)}`;
    this.emitFile(publicPath, source);
    return publicPath;
  }

  return `"data:image/svg+xml;charset=utf-8,${addXmlns(encode(source))}"`;
};

export default inlineLoader;
