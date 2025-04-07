const handleImports = (filePaths: string[], server: boolean) => {
  const paths = Array.from(new Set(filePaths));
  const collectImports: string[] = [];
  const imports = paths
    .map((filePath, index) => {
      collectImports.push(`imports.push(content_${index});`);
      return `import content_${index} from '${filePath}';`;
    })
    .join('\n');

  const content = [
    !server && imports,
    `const imports = [];`,
    !server && collectImports.join(`\n`),
  ].filter(Boolean);

  return content.join('\n');
};

export default handleImports;
