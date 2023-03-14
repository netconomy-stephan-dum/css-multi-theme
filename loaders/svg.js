const path = require("node:path");
const overload = require('../utils/overload');

const SVGLoader = function (source) {
  const callback = this.async();
  const { appDir = process.cwd(), tenants = [] } = this.getOptions();
  return overload(this, { appDir, tenants }, (tenantName, targetFile, rawSource) => {
    this.emitFile(path.join(tenantName, targetFile), rawSource);
  }).then(() => {
    const viewportMatch = /viewBox="(.*?)"/i.exec(source);
    if (!viewportMatch || viewportMatch.length < 2) {
      throw new Error(`viewport not set for icon file ${this.resourcePath}!`);
    }
    const viewport = viewportMatch[1];
    const iconName = path.basename(this.resourcePath, '.svg');
    const helperPath = require.resolve('../utils/spriteStringToObject').replace(/\\\\?/g, '/');
    callback(null, [
      `import spriteStringToObject from "${helperPath}";`,
      // __sprite_name__ will be replaced by the plugin
      `const icon = spriteStringToObject(__sprite_name__ + "#${iconName}?${viewport}");`,
      `export default icon;`
    ].join('\n'));
  });
};

module.exports = SVGLoader;
