const path = require("node:path");
const {URLSearchParams} = require("node:url");

function encode(code) {
  return code
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
}

function addXmlns(code) {
  if (code.indexOf("xmlns") === -1) {
    return code.replace(/<svg/g, '<svg xmlns="http://www.w3.org/2000/svg"');
  } else {
    return code;
  }
}

const createDataURI = (data, mimeType, encoding) => `"data:image/${mimeType};charset=${encoding},${data}`

const fontExts = ['woff', 'woff2', 'otf', 'ttf'];
const videoExts = ['mp4', 'webm', 'ogg', 'mpe?g', 'avi', 'flv'];
const alwaysExternalExts = [...fontExts, ...videoExts];
const inlineLoader = function (rawSource) {
  const source = rawSource.toString();
  const tenantName = new URLSearchParams(this.resourceQuery).get('tenant');
  const ext = path.extname(this.resourcePath).slice(1);

  if (alwaysExternalExts.includes(ext) || source.length > 1024 * 5) {
    const publicPath = '/assets/' + tenantName + '/' + path.basename(this.resourcePath);
    this.emitFile(publicPath, source);
    return publicPath;
  }

  if (ext !== 'svg') {
    return createDataURI(Buffer.from(source).toString('base64'), ext, 'base64');
  }

  return createDataURI(addXmlns(encode(source)), 'svg+xml', 'utf-8')
}

module.exports = inlineLoader;
