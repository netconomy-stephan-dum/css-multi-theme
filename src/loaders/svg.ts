import path from "node:path";
import {LoaderDefinition} from "webpack";

import {TenantOptions} from "../types";
import overload, {EachCallback} from "../utils/overload";

const SVGLoader: LoaderDefinition<TenantOptions> = function (source) {
  const callback = this.async();
  const options = this.getOptions();
  const each: EachCallback = (tenantName, targetFile, rawSource) => {
    this.emitFile(path.join(tenantName, targetFile), rawSource);
  };

  overload(this, options, each).then(() => {
    const viewportMatch = /viewBox="(.*?)"/i.exec(source);
    if (!viewportMatch || viewportMatch.length < 2) {
      throw new Error(`viewport not set for icon file ${this.resourcePath}!`);
    }
    const [viewport] = viewportMatch;
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
