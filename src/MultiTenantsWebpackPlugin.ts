import { Chunk, Compilation, Compiler } from 'webpack';
import { writeFile, mkdir } from 'node:fs/promises';
import { ChunkHandler, Tenant, TenantOptions, UseOption } from './types';
import { RawSource, Source } from 'webpack-sources';
import path from 'node:path';
import getCSSRules from './rules/css';
import getSVGRules from './rules/svg';
import createSVGChunk from './utils/createSVGChunk';
import createCSSChunk from './utils/createCSSChunk';
import createChunk from './utils/createChunk';
import sortPaths from './utils/sortPaths';
import getManifestSyncRule from './rules/manifestSync';
import { createHash } from 'node:crypto';

const pluginName = 'MultiTenantsWebpackPlugin';
interface GlobalOptions {
  svg?: UseOption;
  css?: UseOption;
}

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

const filterExt = (
  auxiliaryFiles: Set<string>,
  assetPath: string,
  tenantName: string,
  ext: string,
) =>
  Array.from(auxiliaryFiles).filter(
    (assetFile) =>
      assetFile.startsWith(`${assetPath}/${tenantName}`) &&
      new RegExp(`\\.${ext}(?:\\?.*)?$`).test(assetFile),
  );

const getDevAssets = (chunkData: ChunkHandler) => {
  const { auxiliaryFiles, assetPath, tenantName } = chunkData;
  const files = sortPaths(filterExt(auxiliaryFiles, assetPath, tenantName, 'css'));
  // const svgFiles = filterExt(auxiliaryFiles, assetPath, tenantName, 'svg');
  // svgFiles.forEach((file) => {
  //   (compilation.assets[file] as Source) = new RawSource(
  //     createSVGChunk(compilation.assets, [file]),
  //   );
  // });

  return files;
  // return [...cssFiles, ...svgFiles];
};

const getProdAssets = (chunkData: ChunkHandler) => {
  const assets: string[] = [];
  createChunk(chunkData, assets, 'css', createCSSChunk);
  return assets;
};

const IS_PROD = process.env.NODE_ENV === 'production';
const getAssets = IS_PROD ? getProdAssets : getDevAssets;

class MultiTenantsWebpackPlugin {
  private readonly options: TenantOptions;

  constructor(appDir: string, assetPath: string, tenants: Tenant[]) {
    this.options = { appDir, assetPath, tenants };
  }

  getAssetRules(use: GlobalOptions = {}) {
    return [
      getManifestSyncRule(this.options),
      ...getSVGRules(this.options, use.svg || []),
      ...getCSSRules(this.options, use.css || []),
    ];
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(hookOptions, () => {
        const { chunks, assets } = compilation;
        const { assetPath, tenants } = this.options;

        return Promise.all(
          tenants.map(({ tenantName }) => {
            const assetsByTenantChunkName: Record<string, string[]> = {};

            chunks.forEach(({ id, auxiliaryFiles, files }) => {
              const castedId = `${id}`;
              const chunkData = {
                assetPath,
                auxiliaryFiles,
                compilation,
                id: castedId,
                tenantName,
              };
              const svgFiles: string[] = [];
              createChunk(chunkData, svgFiles, 'svg', createSVGChunk);
              const cssFiles = getAssets(chunkData);
              assetsByTenantChunkName[castedId] = [...cssFiles, ...svgFiles];

              const [svgSprite] = svgFiles;
              if (svgSprite) {
                files.forEach((chunkFile) => {
                  (assets[chunkFile] as Source) = new RawSource(
                    assets[chunkFile]
                      .source()
                      .toString()
                      .replace(/__sprite_name__/g, svgSprite),
                  );
                });
              }
            });

            const assetsByChunkNameModule = [
              `const assetsByChunkName = ${JSON.stringify(assetsByTenantChunkName)};`,
              `export default assetsByChunkName;`,
            ].join('\n');

            // file is written directly to allow hmr without initial resync
            const assetFilePath = `./dist/${assetPath}/${tenantName}/assetsByChunkName.js`;

            return mkdir(path.dirname(assetFilePath), { recursive: true }).then(() =>
              writeFile(assetFilePath, assetsByChunkNameModule.toString(), { encoding: 'utf-8' }),
            );
          }),
        ).then(() => {
          // replaceInChunks(compilation, (rawSource, { id }) =>
          //   rawSource.replace(/__sprite_name__/g, `${id}.svg${IS_PROD?'':`?${new Date().getTime()}`}`),
          // );
        });
      });
    });
  }
}

export default MultiTenantsWebpackPlugin;
