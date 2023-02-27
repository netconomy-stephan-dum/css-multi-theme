const { writeFile, mkdir } = require('node:fs/promises');

const pluginName = 'ExtractCSSModulesPlugin';
const cssModuleRegEx = /scss\.json$/;

class ExtractCSSModulesPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      pluginName,
      async (compilation, callback) => {
        const cssFilesByChunkName = {};
        const stats = compilation.getStats().toJson();

        await Promise.all(stats.chunks.map((chunk) => {
          const { id, auxiliaryFiles } = chunk;

          const cssClassNames = {};
          cssFilesByChunkName[id] = cssClassNames;
          const cssFiles = auxiliaryFiles.filter((assetFile) => cssModuleRegEx.test(assetFile));

          return Promise.all(cssFiles.map((cssFile) => {
            cssClassNames[cssFile.replace(/\.scss\.json$/, '').replace(/\\(\\)?/g, '/')] = JSON.parse(compilation.assets[cssFile].source());
            compilation.deleteAsset(cssFile);
          }))
        }));

        // TODO: emit as asset
        await mkdir('dist', { recursive: true });
        await writeFile('dist/cssClassNames.json', JSON.stringify(cssFilesByChunkName, null, 2), 'UTF-8');

        return callback();
      }
    );
  }
}

module.exports = ExtractCSSModulesPlugin;