import { Chunk, Compilation, Compiler } from 'webpack';
import { writeFile, mkdir } from 'node:fs/promises';
import { Tenant, TenantOptions, UseOption } from './types';
import { RawSource, Source } from 'webpack-sources';
import path from 'node:path';
import getCSSRules from './rules/css';
import getSVGRules from './rules/svg';
import createSVGChunk from './utils/createSVGChunk';
import createChunk from './utils/createChunk';
import sortPaths from './utils/sortPaths';
import getManifestSyncRule from './rules/manifestSync';

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
        const { chunks } = compilation;
        const { assetPath, tenants } = this.options;

        return Promise.all(
          tenants.map(({ tenantName }) => {
            const assetsByTenantChunkName: Record<string, string[]> = {};

            chunks.forEach(({ id, auxiliaryFiles }) => {
              const castedId = `${id}`;
              const cssFiles = sortPaths(
                Array.from(auxiliaryFiles).filter(
                  (assetFile) =>
                    assetFile.startsWith(`${assetPath}/${tenantName}`) &&
                    /\.css(?:\?.*)?$/.test(assetFile),
                ),
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

              const svgFiles: string[] = [];

              createChunk(
                compilation,
                auxiliaryFiles,
                tenantName,
                castedId,
                svgFiles,
                'svg',
                createSVGChunk,
              );

              assetsByTenantChunkName[castedId] = [...cssFiles, ...svgFiles];
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
          replaceInChunks(compilation, (rawSource, { id }) =>
            rawSource.replace(/__sprite_name__/g, `${id}`),
          );
        });
      });
    });
  }
}

export default MultiTenantsWebpackPlugin;
