import { Compilation, Compiler } from 'webpack';
import {Tenant, TenantOptions, UseOption } from "./types";
import { RawSource, Source } from 'webpack-sources';
import getCSSRules from './rules/css';
import getSVGRules from './rules/svg';
import createSVGChunk from './utils/createSVGChunk';
import createCSSChunk from './utils/createCSSChunk';
import createChunk from './utils/createChunk';

const pluginName = "MultiTenantsWebpackPlugin";

interface GlobalOptions {
  svg?: UseOption;
  css?: UseOption;
}
export const DEFAULT_TENANT = { tenantDirs: [], tenantName: 'default' };
const hookOptions = {
  name: pluginName,
  stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED
};
class MultiTenantsWebpackPlugin {
  private readonly tenants: Tenant[];

  private readonly options: TenantOptions;

  constructor(appDir: string, tenants: Tenant[]) {
    this.tenants = tenants || [DEFAULT_TENANT];
    this.options = { appDir, tenants };
  }

  getCSSRules(use: UseOption) {
    return getCSSRules(this.options, use);
  }

  getSVGRules(use: UseOption) {
    return getSVGRules(this.options, use);
  }

  getAssetRules(use: GlobalOptions = {}) {
    return [
      ...this.getSVGRules(use.svg || []),
      ...this.getCSSRules(use.css || [])
    ];
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      pluginName,
      (compilation) => {
        compilation.hooks.processAssets.tap(
          hookOptions,
          () => {
            const { chunks, assets } = compilation;

            chunks.forEach(({ id, files }) => {
              files.forEach((chunkFile) => {
                (assets[chunkFile] as Source) = new RawSource(
                  assets[chunkFile].source().toString().replace(/__sprite_name__/g, `\\"${id}\\"`)
                );
              });
            })

            this.tenants.forEach(({ tenantName }) => {
              const assetsByTenantChunkName: Record<string, string[]> = {};

              chunks.forEach((chunk) => {
                const { id, auxiliaryFiles } = chunk;
                const castedId = `${id}`;
                const files: string[] = [];
                assetsByTenantChunkName[castedId] = files;

                createChunk(compilation, auxiliaryFiles, tenantName, castedId, files, 'scss', createCSSChunk, 'css');
                createChunk(compilation, auxiliaryFiles, tenantName, castedId, files, 'svg', createSVGChunk);
              });

              (assets[`assets/${tenantName}/assetsByChunkName.js`] as Source) = new RawSource([
                `const assetsByChunkName = ${JSON.stringify(assetsByTenantChunkName)};`,
                `export default assetsByChunkName;`,
              ].join('\n'));
            });
          }
        )
      }
    )
  }
}

export default MultiTenantsWebpackPlugin;
