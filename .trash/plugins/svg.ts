import { Chunk, Compilation, Compiler } from 'webpack';
import { RawSource, Source } from 'webpack-sources';
import createChunk from '../utils/createChunk';
import createSVGChunk from '../utils/createSVGChunk';

const pluginName = 'SVGSpritePlugin';
type Transform = (source: string, chunk: Chunk) => string;
const executeReplacement = (compilation: Compilation, transform: Transform) => {
  const { chunks, assets } = compilation;
  chunks.forEach((chunk) => {
    chunk.files.forEach((chunkFile) => {
      (assets[chunkFile] as Source) = new RawSource(
        transform(assets[chunkFile].source().toString(), chunk),
      );
    });
  });
};

const setupOptions = {
  name: pluginName,
  stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED,
};
const extendAssetsByChunkName = (compilation: Compilation, assetPath: string) => {
  const { chunks, assets } = compilation;
  // TODO: we should use json instead
  const assetsByChunkName: Record<string, string[]> = {};
  // const assetsByChunkName = new Function('return '+(assets[`assets/assetsByChunkName.js`].source().toString() || '{}'))();
  chunks.forEach((chunk) => {
    const { id, auxiliaryFiles } = chunk;
    const castedId = `${id}`;
    const files: string[] = [];
    assetsByChunkName[castedId] = files;
    createChunk(
      { assetPath, auxiliaryFiles, compilation, id: castedId, tenantName: '' },
      files,
      'svg',
      createSVGChunk,
    );
  });

  (assets[`assets/assetsByChunkName.js`] as Source) = new RawSource(
    [
      `const assetsByChunkName = ${JSON.stringify(assetsByChunkName)};`,
      `export default assetsByChunkName;`,
    ].join('\n'),
  );
};
const transform: Transform = (code, { id }) => code.replace(/__sprite_name__/g, `\\"${id}\\"`);
interface SVGPluginOptions {
  assetPath: string;
  appDir: string;
}
class SVGSpritePlugin {
  private readonly options: SVGPluginOptions;

  constructor(options: SVGPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(setupOptions, () => {
        executeReplacement(compilation, transform);
        extendAssetsByChunkName(compilation, this.options.assetPath);
      });
    });
  }
}

module.exports = SVGSpritePlugin;
