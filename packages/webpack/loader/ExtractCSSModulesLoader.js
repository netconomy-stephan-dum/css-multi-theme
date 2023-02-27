const path = require('node:path');

const packagesFolder = path.join(process.cwd());
const cssModuleInterfaceLoader = function (source) {
  const json = source.replace(/^\/\/ Exports\n/, '').replace('export default ', '').replace(/;(\n)?$/, '');

  const filePath = path.relative(packagesFolder, this.resourcePath)+'.json';
  const base = path.basename(filePath, '.scss.json');
  const shortPath = filePath.replace(`${base}${path.sep}${base}.scss.json`, base+'.scss.json');
  const microExternal = shortPath.replace(/^\.\./, '@micro');
  this.emitFile(microExternal, json);

  return source;
};

module.exports = cssModuleInterfaceLoader;
