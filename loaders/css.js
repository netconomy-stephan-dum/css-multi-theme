const path = require('node:path');
const fs = require('node:fs/promises');

const getShortPath = (filePath) => {
  const [base, ext] = path.basename(filePath).split('.');
  return filePath
    .replace(`${base}${path.sep}${base}.${ext}`, base+'.'+ext)
    .replace(/^\.\./, '@micro');
}

const exists = (filePath) => fs.access(filePath).then(() => true, () => false);

const getOverloadFile = async ({ tenantDirs, appDir }, resourcePath) => {
  for (let i = 0; i < tenantDirs.length; i++) {
    const tenantPath = path.join(tenantDirs[i], resourcePath);

    if (await exists(tenantPath)) {
      return tenantPath;
    }
    const [baseName, ext] = path.basename(tenantPath).split('.');

    const longPath = path.join(path.dirname(tenantPath), baseName, baseName+'.'+ext);
    if (await exists(longPath)) {
      return longPath;
    }
  }
  return null;
};
const cssLoader = async function (source) {
  const options = this.getOptions();
  const { appDir, tenants, count } = options;
  const json = source.replace(/^\/\/ Exports\n/, '').replace('export default ', '').replace(/;(\n)?$/, '');
  const filePath = path
    .relative(appDir, this.resourcePath)
    .replace(/\\/g, '/');

  const targetFile = filePath.replace(/^\.\.\//, '');
  const shortPath = getShortPath(filePath);
  const classNames = encodeURIComponent(JSON.stringify(json));
  await Promise.all(tenants.map(({ tenantDirs, tenantName }) => getOverloadFile({ tenantDirs, appDir }, shortPath)
    .then((overloadPath) => new Promise((resolve, reject) => {
      const search = new URLSearchParams({ classNames, tenant: tenantName });
      this.loadModule((overloadPath || this.resourcePath)+`?${search.toString()}`, (error, source) => {
        if (error) {
          return reject(error);
        }

        this.emitFile(`${tenantName}/${count}/${targetFile}`, source.toString());

        resolve();
      });
    }))
  ));

  return source;
};

module.exports = cssLoader;
