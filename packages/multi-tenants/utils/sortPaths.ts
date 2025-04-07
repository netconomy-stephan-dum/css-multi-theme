const cast = (filePath: string) => Number.parseInt(filePath.split('/')[1], 10);

const sortPaths = (chunks: string[]) =>
  chunks.sort((filePathA, filePathB) => (cast(filePathA) < cast(filePathB) ? -1 : 1));

export default sortPaths;
