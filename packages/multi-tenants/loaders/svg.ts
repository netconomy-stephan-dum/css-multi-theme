import path from 'node:path';
import { LoaderDefinition } from 'webpack';

import { TenantOptions } from '../types';
import resolveToRelativeOverload from '../utils/resolveToRelativeOverload';

const svgLoader: LoaderDefinition<TenantOptions> = function svgLoader(source) {
  const callback = this.async();
  const options = this.getOptions();

  const iconName = path.basename(this.resourcePath, '.svg');
  const { appDir, tenants } = options;

  resolveToRelativeOverload(this, options).then(({ src, dest }) =>
    Promise.all(
      Object.entries(tenants).map(([tenantName, tenantDirs]) =>
        this.getResolve({ modules: tenantDirs })(appDir, src)
          .catch(() => {
            return this.resourcePath;
          })
          .then((overloadPath) => {
            const loaderSegments = this.utils.contextify(this.context, overloadPath).split('!');
            loaderSegments[0] = `${loaderSegments[0]}?hash=false&dest=${tenantName}/svg/${dest}`;
            return loaderSegments.join('!');
          }),
      ),
    ).then((filePaths) => {
      const svgPaths = Array.from(new Set(filePaths));
      const imports = svgPaths.map((filePath) => `require('${filePath}').default`).join(',');
      const viewBoxMatch = /viewBox="(.*?)"/i.exec(source);

      if (!viewBoxMatch || viewBoxMatch.length < 2) {
        throw new Error(`viewport not set for icon file ${this.resourcePath}!`);
      }

      const [, viewBox] = viewBoxMatch;
      // const basePath = process.env.NODE_ENV === 'production' ? '__sprite_name__' : `svg/${dest}`;

      callback(
        null,
        [
          `const imports = [${imports}];`,
          // __sprite_name__ will be replaced by the plugin
          `const icon = ["__sprite_name__", "${iconName}", "${viewBox}"];`,
          `export default icon;`,
        ].join('\n'),
      );
    }),
  );
};

module.exports = svgLoader;
