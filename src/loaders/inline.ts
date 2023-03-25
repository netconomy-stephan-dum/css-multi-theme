import path from "node:path";
import {URLSearchParams} from "node:url";
import {LoaderDefinition} from "webpack";

const encode = (code: string) => code
  .replace(/%/g, "%25")
  .replace(/</g, "%3C")
  .replace(/>/g, "%3E")
  .replace(/&/g, "%26")
  .replace(/#/g, "%23")
  .replace(/{/g, "%7B")
  .replace(/}/g, "%7D")
  .replace(/'/g, "%22")
  .replace(/"/g, "'")
  .replace(/\s+/g, " ")
  .trim();
const addXmlns = (code: string) => {
  if (code.indexOf("xmlns") === -1) {
    return code.replace(/<svg/g, '<svg xmlns="http://www.w3.org/2000/svg"');
  } 
    return code;
  
};

const createDataURI = (data: string, mimeType: string, charset: string) => `"data:image/${mimeType};charset=${charset},${data}"`;

const fontExts = ['woff', 'woff2', 'otf', 'ttf'];
const videoExts = ['mp4', 'webm', 'ogg', 'mpe?g', 'avi', 'flv'];
const alwaysExternalExts = [...fontExts, ...videoExts];

// TODO: check if a normal asset module can be used instead
const inlineLoader: LoaderDefinition = function (rawSource) {
  const source = rawSource.toString();
  // TODO: use this.query instead
  const tenantName = new URLSearchParams(this.resourceQuery).get('tenant');
  const ext = path.extname(this.resourcePath).slice(1);

  if (alwaysExternalExts.includes(ext) || source.length > 1024 * 5) {
    const publicPath = `/assets/${  tenantName  }/${  path.basename(this.resourcePath)}`;
    this.emitFile(publicPath, source);
    return publicPath;
  }

  if (ext !== 'svg') {
    return createDataURI(Buffer.from(source).toString('base64'), ext, 'base64');
  }

  return createDataURI(addXmlns(encode(source)), 'svg+xml', 'utf-8')
};

module.exports = inlineLoader;
