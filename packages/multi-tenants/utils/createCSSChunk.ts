import { Compilation } from 'webpack';
import sortPaths from './sortPaths';

const createCSSChunk = (assets: Compilation['assets'], filePaths: string[]) =>
  sortPaths(filePaths)
    .map((filePath) => assets[filePath].source())
    .join('');

export default createCSSChunk;
