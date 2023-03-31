import path from 'node:path';
import { Compilation } from 'webpack';
const createSVGChunk = (assets: Compilation['assets'], filePaths: string[]) => {
  const symbols: string[] = [];
  // sort is need to keep contentHash stable
  filePaths.sort().forEach((filePath) => {
    // TODO: strip xmlns! also width & height
    symbols.push(
      assets[filePath]
        .source()
        .toString()
        .replace(/^<svg /, `<symbol id="${path.basename(filePath, '.svg').split('_')[0]}" `)
        .replace(/<\/svg>$/, '</symbol>'),
    );
  });
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('\n')}</svg>`;
};

export default createSVGChunk;
