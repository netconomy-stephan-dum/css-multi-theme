import { Compilation, Compiler, Chunk } from 'webpack';
import { writeFile, mkdir } from 'node:fs/promises';
import { TenantOptions, UseOption } from './types';
import { RawSource, Source } from 'webpack-sources';
import path from 'node:path';
import getCSSRules from './rules/css';
import getSVGRules from './rules/svg';
import createSVGChunk from './utils/createSVGChunk';
import createChunk from './utils/createChunk';
import getManifestSyncRule from './rules/manifestSync';
import createCSSHandler from './utils/createCSSHandler';

const pluginName = 'MultiTenantsWebpackPlugin';
interface GlobalOptions {
  svg?: UseOption;
  css?: UseOption;
}

const hookOptions = {
  name: pluginName,
  stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED,
};
const replaceSpriteName = (
  files: string[] | Set<string>,
  spriteName: string,
  assets: Compilation['assets'],
  regExp?: RegExp,
) => {
  files.forEach((chunkFile) => {
    // only replace __sprite_name__ in js files css files will be handelt per tenant
    if (!regExp || regExp.test(chunkFile)) {
      (assets[chunkFile] as Source) = new RawSource(
        assets[chunkFile]
          .source()
          .toString()
          .replace(/__sprite_name__/g, `${spriteName}`),
      );
    }
  });
};

interface PrefetchOrPreload {
  assets: { name: string }[];
  chunks: string[];
  name: string;
}
interface StatsFile {
  publicPath: string;
  outputPath: string;
  namedChunkGroups: Record<
    string,
    {
      name: string;
      chunks: string[];
      assets: { name: string }[];
      childAssets: {
        prefetch?: PrefetchOrPreload[];
        preload?: PrefetchOrPreload[];
      };
    }
  >;
  chunks: { id: string; files: string[] }[];
  assets: { name: string }[];
}

interface ChunkGroup {
  name?: string;
  id: string | number;
  options: {
    prefetchOrder?: number;
    preloadOrder?: number;
  };
  parentsIterable: Set<ChunkGroup>;
}
const addPreloaderOrPrefetch = (
  statsFile: StatsFile,
  group: ChunkGroup,
  prop: 'prefetch' | 'preload',
  files: string[],
  name: string,
) => {
  if (`${prop}Order` in group.options) {
    group.parentsIterable.forEach((parent) => {
      const parentAsstes = statsFile.namedChunkGroups[parent.name || parent.id].childAssets;
      parentAsstes[prop] ||= [];
      (parentAsstes[prop] as PrefetchOrPreload[]).push({
        assets: Array.from(files).map((filePath) => ({ name: filePath })),
        chunks: [name],
        name,
      });
    });
  }
};
const assignStats = (
  statsFile: StatsFile,
  name: string,
  files: string[],
  groupsIterable: Chunk['groupsIterable'],
) => {
  statsFile.chunks.push({ files, id: name });
  const statsAssets = files.map((filePath) => ({ name: filePath }));
  statsFile.assets.push(...statsAssets);
  statsFile.namedChunkGroups[name] = {
    assets: statsAssets,
    childAssets: {},
    chunks: [name],
    name,
  };

  Array.from(groupsIterable).forEach((group) => {
    addPreloaderOrPrefetch(statsFile, group, 'prefetch', files, name);
    addPreloaderOrPrefetch(statsFile, group, 'preload', files, name);
  });
};

class MultiTenantsPlugin {
  private readonly options: TenantOptions;

  constructor(options: TenantOptions) {
    this.options = options;
  }

  getAssetRules(use: GlobalOptions = {}) {
    return [
      getManifestSyncRule(this.options),
      ...getSVGRules(this.options, use.svg || []),
      ...getCSSRules(this.options, use.css || []),
    ];
  }

  apply(compiler: Compiler) {
    const getAssets = createCSSHandler(compiler.options.mode === 'production');

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(hookOptions, () => {
        const { chunks, assets } = compilation;
        const { assetDir, tenants, server } = this.options;

        chunks.forEach(({ name, files }) => {
          replaceSpriteName(files, `${name}_`, assets, /\.js(\?.+)?$/u);
        });
        if (server) {
          return Promise.resolve();
        }
        const baseStats = compilation.getStats().toJson({
          all: false,
          assets: false,
          cachedAssets: false,
          chunkGroupChildren: false,
          chunkGroups: false,
          chunks: false,
          hash: true,
          ids: false,
          outputPath: true,
          publicPath: true,
        });

        return Promise.all(
          Object.keys(tenants).map((tenantName) => {
            const assetsByTenantChunkName: Record<string, string[]> = {};

            const statsFile = {
              ...baseStats,
              assets: [],
              chunks: [],
              namedChunkGroups: {},
            } as StatsFile;

            chunks.forEach(({ name, auxiliaryFiles, files, groupsIterable }) => {
              if (!name) {
                return;
              }

              const chunkData = {
                assetDir,
                auxiliaryFiles,
                compilation,
                id: name,
                tenantName,
              };
              const svgFiles: string[] = [];

              createChunk(chunkData, svgFiles, 'svg', createSVGChunk, false);
              const cssFiles = getAssets(chunkData);

              assetsByTenantChunkName[name] = [...cssFiles, ...svgFiles, ...Array.from(files)];
              assignStats(statsFile, name, assetsByTenantChunkName[name], groupsIterable);
              const [svgSprite] = svgFiles;
              if (svgSprite) {
                replaceSpriteName(cssFiles, `/${svgSprite}`, assets);
              }
            });

            (assets[`/assets/${tenantName}/loadable-stats.json`] as Source) = new RawSource(
              JSON.stringify(statsFile, null, 2),
            );

            const assetsByChunkNameModule = [
              `const assetsByChunkName = ${JSON.stringify(assetsByTenantChunkName)};`,
              `export default assetsByChunkName;`,
            ].join('\n');

            // file is written directly to allow hmr without initial resync
            const assetFilePath = `./dist/${assetDir}/${tenantName}/assetsByChunkName.mjs`;
            return mkdir(path.dirname(assetFilePath), { recursive: true }).then(() =>
              writeFile(assetFilePath, assetsByChunkNameModule.toString(), { encoding: 'utf-8' }),
            );
          }),
          // eslint-disable-next-line no-undefined
        ).then(() => undefined);
      });
    });
  }
}

export default MultiTenantsPlugin;
