import path from 'node:path';
import { Compilation } from 'webpack';
import { readFileSync } from 'node:fs';

const svgTemplate = readFileSync(
  path.join(__dirname.replace('dist', ''), './template.svg'),
  'utf-8',
);
const createSVGChunk = (assets: Compilation['assets'], filePaths: string[]) => {
  const symbols: string[] = [];
  const usages: string[] = [];

  // sort is need to keep contentHash stable
  filePaths.sort().forEach((filePath) => {
    const [id] = path.basename(filePath, '.svg').split('_');

    usages.push(`<use id="${id}" xlink:href="#${id}-symbol"></use>`);

    symbols.push(
      assets[filePath]
        .source()
        .toString()
        .replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"/, '')
        .replace(/^<svg/, `<symbol id="${id}-symbol" `)
        .replace(/\s+/, ' ')
        .replace(/<\/svg>$/, '</symbol>'),
    );
  });

  return svgTemplate
    .replace('<!-- @symbols@ -->', symbols.join(''))
    .replace('<!-- @usages@ -->', usages.join(''));
};

export default createSVGChunk;
