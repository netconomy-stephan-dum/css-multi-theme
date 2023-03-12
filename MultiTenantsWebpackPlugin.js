const { RawSource } = require('webpack-sources');

const getCSSRules = require('./rules/css');
const getSVGRules = require('./rules/svg');
const createSVGChunk = require('./utils/createSVGChunk')
const createCSSChunk = require('./utils/createCSSChunk')
const createChunk = require('./utils/createChunk');

const pluginName = 'MultiTenantsWebpackPlugin';

class MultiTenantsWebpackPlugin {
  constructor(tenants, appDir) {
    this.tenants = tenants;
    this.options = { tenants, appDir };
  }
  getCSSRules(use) {
    return getCSSRules(this.options, use);
  }
  getSVGRules(use) {
    return getSVGRules(this.options, use);
  }
  getAssetRules(use = {}) {
    return [
      ...this.getSVGRules(use.svg || []),
      ...this.getCSSRules(use.css || [])
    ];
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      pluginName,
      async (compilation, callback) => {
        const stats = compilation.getStats().toJson();
        const { assetsByChunkName, chunks } = stats;

        chunks.forEach(({ id, files }) => {
          files.forEach((chunkFile) => {
            compilation.assets[chunkFile] = new RawSource(
              compilation.assets[chunkFile].source().replace(/__sprite_name__/g, `\\"${id}\\"`)
            );
          });
        })

        await Promise.all(this.tenants.map(({ tenantName }) => {
          const assetsByTenantChunkName = {};
          return Promise.all(chunks.map((chunk) => {
            const { id, auxiliaryFiles, files } = chunk;
            const assets = assetsByChunkName[id]?.slice() || [];
            assetsByTenantChunkName[id] = assets;

            return Promise.all([
              createChunk(compilation, auxiliaryFiles, tenantName, id, assets, 'scss', createCSSChunk, 'css'),
              createChunk(compilation, auxiliaryFiles, tenantName, id, assets, 'svg', createSVGChunk),
            ]);
          })).then(() => {
            compilation.assets[`assets/${tenantName}/assetsByChunkName.js`] = new RawSource([
              `const assetsByChunkName = ${JSON.stringify(assetsByTenantChunkName)};`,
              `export default assetsByChunkName;`,
            ].join('\n'));
          });
        }));

        callback();
      }
    );
  }
}

module.exports = MultiTenantsWebpackPlugin;