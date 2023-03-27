import { Chunk, Compilation, Compiler } from 'webpack';
import { Tenant, TenantOptions, UseOption } from './types';
import { RawSource, Source } from 'webpack-sources';
import getCSSRules from './rules/css';
import getSVGRules from './rules/svg';
import createSVGChunk from './utils/createSVGChunk';
// import createCSSChunk from './utils/createCSSChunk';
import createChunk from './utils/createChunk';

const pluginName = 'MultiTenantsWebpackPlugin';
type AssetsByChunkName = Record<string, string[]>;
interface GlobalOptions {
  svg?: UseOption;
  css?: UseOption;
}
const printAssetsByChunkName = (assetsByChunkName: AssetsByChunkName) =>
  new RawSource(
    [
      `const assetsByChunkName = ${JSON.stringify(assetsByChunkName)};`,
      `export default assetsByChunkName;`,
    ].join('\n'),
  );

export const DEFAULT_TENANT = { tenantDirs: [], tenantName: 'default' };

const hookOptions = {
  name: pluginName,
  stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED,
};

type Replacer = (rawSource: string, chunk: Chunk) => string;
const noop = () => '';
const replaceInChunks = (compilation: Compilation, replacer: Replacer = noop) => {
  const { chunks, assets } = compilation;

  chunks.forEach((chunk) => {
    chunk.files.forEach((chunkFile) => {
      (assets[chunkFile] as Source) = new RawSource(
        replacer(assets[chunkFile].source().toString(), chunk),
      );
    });
  });
};

class MultiTenantsWebpackPlugin {
  private readonly tenants: Tenant[];

  private readonly options: TenantOptions;

  constructor(appDir: string, assetPath: string, tenants: Tenant[]) {
    this.tenants = tenants || [DEFAULT_TENANT];
    this.options = { appDir, assetPath, tenants };
  }

  getCSSRules(use: UseOption) {
    return getCSSRules(this.options, use);
  }

  getSVGRules(use: UseOption) {
    return getSVGRules(this.options, use);
  }

  getAssetRules(use: GlobalOptions = {}) {
    return [...this.getSVGRules(use.svg || []), ...this.getCSSRules(use.css || [])];
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(hookOptions, () => {
        const { chunks, assets } = compilation;

        replaceInChunks(compilation, (rawSource, { id }) =>
          rawSource.replace(/__sprite_name__/g, `\\"${id}\\"`),
        );

        this.tenants.forEach(({ tenantName }) => {
          const assetsByTenantChunkName: Record<string, string[]> = {};
          chunks.forEach(({ id, auxiliaryFiles }) => {
            const castedId = `${id}`;
            const files = Array.from(auxiliaryFiles).filter(
              (assetFile) =>
                (!tenantName || assetFile.startsWith(tenantName)) &&
                /\.css(?:\?.*)?$/.test(assetFile),
            );
            // todo: execute based on prod flag
            // const files: string[] = [];
            // createChunk(
            //   compilation,
            //   auxiliaryFiles,
            //   tenantName,
            //   castedId,
            //   files,
            //   'css',
            //   createCSSChunk,
            // );
            assetsByTenantChunkName[castedId] = files;

            createChunk(
              compilation,
              auxiliaryFiles,
              tenantName,
              castedId,
              files,
              'svg',
              createSVGChunk,
            );
          });

          // TODO: check how to propage update to this file
          (assets[`assets/${tenantName}/assetsByChunkName.js`] as Source) =
            printAssetsByChunkName(assetsByTenantChunkName);
        });
      });
    });
  }
}

export default MultiTenantsWebpackPlugin;
