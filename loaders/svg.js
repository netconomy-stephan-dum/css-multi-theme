const path = require("node:path");
const fs = require('node:fs/promises');
const exists = (filePath) => fs.access(filePath).then(() => true, () => false);

const getOverloadFile = async ({ tenantDirs, appDir }, resourcePath) => {
  for (let i = 0; i < tenantDirs.length; i++) {
    const tenantPath = path.join(tenantDirs[i], resourcePath);

    if (await exists(tenantPath)) {
      return tenantPath;
    }
  }
  return null;
};

const SVGLoader = async function (source) {
  const { appDir = process.cwd(), tenants = [] } = this.getOptions();

  const filePath = path
    .relative(appDir, this.resourcePath)
    .replace(/\\/g, '/');

  const targetFile = filePath.replace(/^\.\.\//, '');
  const lookupFile = filePath.replace(/^\.\./, '@micro');

  await Promise.all(tenants.map(({ tenantDirs, tenantName }) => getOverloadFile({ tenantDirs, appDir }, lookupFile)
    .then((overloadPath) => new Promise((resolve, reject) => {
        this.loadModule(overloadPath || this.resourcePath, (error, source, sourceMap, module) => {
          if (error) {
            return reject(error);
          }

          this.emitFile(path.join(tenantName, targetFile), source.toString());
          resolve();
        });
      })
    )
  ));
  const viewportMatch = /viewBox="(.*?)"/i.exec(source);
  if (!viewportMatch || viewportMatch.length < 2) {
    throw new Error(`viewport not set for icon file ${this.resourcePath}!`);
  }
  const viewport = viewportMatch[1];
  const iconName = path.basename(this.resourcePath, '.svg');
  const helperPath = require.resolve('../utils/spriteStringToObject').replace(/\\\\?/g, '/');
  return [
    `import spriteStringToObject from "${helperPath}";`,
    // __sprite_name__ will be replaced by the plugin
    `const icon = spriteStringToObject(__sprite_name__ + "#${iconName}?${viewport}");`,
    `export default icon;`
  ].join('\n');
};

module.exports = SVGLoader;
