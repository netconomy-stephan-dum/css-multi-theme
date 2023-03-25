import { Compilation } from "webpack";

const cast = (filePath: string) => Number.parseInt(filePath.split('/')[1], 10);

const createCSSChunk = (assets: Compilation["assets"], filePaths: string[]) => filePaths
    .sort((filePathA, filePathB) => cast(filePathA) < cast(filePathB) ? 1 : -1)
    .map((filePath) => assets[filePath].source()).join('');

export default createCSSChunk;
