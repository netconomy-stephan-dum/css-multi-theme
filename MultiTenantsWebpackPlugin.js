const {Compilation} = require('webpack');
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
    compiler.hooks.thisCompilation.tap(
      pluginName,
      (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: pluginName,
            stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED
          },
          () => {
            const { chunks, assets } = compilation;

            chunks.forEach(({ id, files }) => {
              files.forEach((chunkFile) => {
                assets[chunkFile] = new RawSource(
                  assets[chunkFile].source().replace(/__sprite_name__/g, `\\"${id}\\"`)
                );
              });
            })

            return Promise.all(this.tenants.map(({ tenantName }) => {
              const assetsByTenantChunkName = {};
              return Promise.all(Array.from(chunks).map((chunk) => {
                const { id, auxiliaryFiles } = chunk;
                const assets = [];
                assetsByTenantChunkName[id] = assets;

                return Promise.all([
                  createChunk(compilation, auxiliaryFiles, tenantName, id, assets, 'scss', createCSSChunk, 'css'),
                  createChunk(compilation, auxiliaryFiles, tenantName, id, assets, 'svg', createSVGChunk),
                ]);
              })).then(() => {
                assets[`assets/${tenantName}/assetsByChunkName.js`] = new RawSource([
                  `const assetsByChunkName = ${JSON.stringify(assetsByTenantChunkName)};`,
                  `export default assetsByChunkName;`,
                ].join('\n'));
              });
            })).then(() => {});
          }
        )
      }
    )
  }
}

module.exports = MultiTenantsWebpackPlugin;