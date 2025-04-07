import path from 'node:path';
import { LoaderDefinition } from 'webpack';

import { TenantOptions } from '../types';
import resolveTenants from './utils/resolveTenants';
import handleImports from './utils/handleImports';

const svgLoader: LoaderDefinition<TenantOptions> = function svgLoader(source) {
  const callback = this.async();
  const options = this.getOptions();

  const iconName = path.basename(this.resourcePath, '.svg');
  const { server } = options;

  resolveTenants(
    this,
    (tenantName: string) => `?hash=false&dest=${tenantName}/svg/${iconName}.svg`,
  ).then((filePaths) => {
    const viewBoxMatch = /viewBox="(.*?)"/i.exec(source);

    if (!viewBoxMatch || viewBoxMatch.length < 2) {
      throw new Error(`viewport not set for icon file ${this.resourcePath}!`);
    }

    const [, viewBox] = viewBoxMatch;

    callback(
      null,
      [
        handleImports(filePaths, server),
        // __sprite_name__ will be replaced by the plugin
        `const icon = ["__sprite_name__", "${iconName}", "${viewBox}"];`,
        `export default icon;`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  });
};

module.exports = svgLoader;
