const { readFile, writeFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSOnlyPlugin = require('./plugins/CSSOnlyPlugin');
const realFileSystem = require('node:fs');

const { Volume } = require('memfs');
const { Union } = require('unionfs');

const webpackPromise = (configs) => {
  return Promise.all(
    (Array.isArray(configs) ? configs : [configs]).map(({ inputFileSystem, ...config}) => {
      const compiler = webpack(config);

      if (inputFileSystem) {
        compiler.inputFileSystem = inputFileSystem;
      }

      return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error) {
            return reject(error);
          }

          resolve(stats);
        });
      });
    })
  );
};
const normalizeDir = (themeDir) => themeDir.replace(/\\(\\)?/g, '/');
const createVirtualFS = async ({ themeDirs, appDir }, cssFilesByChunkName) => {
  const { globby } = await import('globby');
  const virtualFS = {};
  await Promise.all(Object.entries(cssFilesByChunkName).map(([chunkName, classNamesByFilePath]) => {
    const chunkFiles = [];
    return Promise.all(Object.keys(classNamesByFilePath).map((filePath) => {
      const patterns = [];

      for(let i = 0; i < themeDirs.length ; i++) {
        const base = path.basename(filePath);
        const glob = path.join(themeDirs[i], path.dirname(filePath)).replace(/\\/g, '/');
        patterns.push(`${glob}/${base}.scss`, `${glob}/${base}/${base}.scss`);
      }
      const defaultBase = path.basename(filePath);
      const defaultGlob = path.join(appDir, path.dirname(filePath.replace('@micro', '..'))).replace(/\\/g, "/");
      patterns.push(`${defaultGlob}/${defaultBase}.scss`, `${defaultGlob}/${defaultBase}/${defaultBase}.scss`);

      return globby(patterns).then((files) => {
        if (files.length) {
          chunkFiles.push(files[0]);
        }
      });
    })).then(async () => {
      const imports = [];
      const importNames = [];

      await Promise.all(chunkFiles.map((filePath) => {
        return readFile(filePath, 'UTF-8').then((fileContents) => {
          const base = path.basename(filePath, '.scss');

          virtualFS[filePath] = fileContents;
          imports.push(`import ${base} from "${filePath}";`);
          importNames.push(base);
        });
      }));
      virtualFS[chunkName+'.js'] = [
        imports.join('\n'),
        `const styles = [${importNames.join(',')}];`,
        `export default styles;`
      ].join('\n')
    })
  }));

  virtualFS['index.js'] = `Promise.all([`+Object.keys(cssFilesByChunkName).map(
    (chunkName) =>  `import(/* webpackChunkName: "${chunkName}" */"./${chunkName}"),`
  ).join('\n')+`]).then(console.log);`;

  return virtualFS;
};

const createLocalIdent = (classNamesByFilePath, appDir, normalizedThemeDirs) => (context, localIdentName, localName) => {
  const filePath = normalizeDir(context.resourcePath).replace(normalizeDir(appDir)+'/', '');
  const base = path.basename(filePath, '.scss');
  const shortPath = filePath.replace(`${base}/${base}.scss`, base).replace(/.scss$/, '');
  const relative = normalizedThemeDirs.reduce((current, themeDir) => current.replace(themeDir+'/', ''), shortPath);
  const normalized = relative.replace(normalizeDir(path.join(__dirname, '../components')), '@micro/components')
  const className = classNamesByFilePath[normalized]?.[localName];

  if (className) {
    return className;
  }

  if (normalized in classNamesByFilePath) {
    throw new Error(`Classname '${localName}' did not match any selector. Possible Selectors:\n\t${Object.keys(classNamesByFilePath[shortPath]).join('\n\t')}`)
  }

  throw new Error(`${normalized} did not match any file! Possible Files:\n\t${Object.keys(classNamesByFilePath).join('\n\t')}`);
};

const getWebpackConfig = async (options, assetPath) => {
  const { appDir, cssFileByChunkNameFile, themeDirs } = options;
  const normalizedThemeDirs = themeDirs.map(normalizeDir);
  const cssFilesByChunkName = JSON.parse(await readFile(cssFileByChunkNameFile, 'UTF-8'));
  const classNamesByFilePath = Object.assign({}, ...Object.values(cssFilesByChunkName));
  const virtualFS = await createVirtualFS(options, cssFilesByChunkName, normalizedThemeDirs);
  console.log(virtualFS);
  return {
    context: appDir,
    output: {
      path: path.join(appDir, `dist/${assetPath}`),
      filename: './[name]_[contenthash].js',
      clean: true,
    },
    entry: { index: './index.js'},
    mode: 'development',
    inputFileSystem: new Union()
      .use(realFileSystem)
      .use(Volume.fromJSON(virtualFS, appDir)),
    plugins: [
      new CSSOnlyPlugin(),
      new MiniCssExtractPlugin({
        insert: '',
        filename: '[name]_[contenthash].css',
      })
    ],
    module: {
      rules: [
        {
          test: /[jt]sx?$/,
          use: [
            require.resolve("swc-loader")
          ],
        },
        {
          test: /scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                modules: {
                  getLocalIdent: createLocalIdent(classNamesByFilePath, appDir, normalizedThemeDirs),
                }
              },
            },
            require.resolve('sass-loader'),
          ]
        }
      ]
    }
  };
};

const prepareCssByChunkName = ({ index, ...chunks }, assetDir) => {
  const cssByChunkName = {};

  Object.entries(chunks).forEach(([chunk, assetFiles]) => {
    cssByChunkName[chunk] = assetFiles.filter((assetFile) => /\.css$/.test(assetFile)).map((assetFile) => path.join(assetDir, assetFile).replace(/\\(\\)?/g, '/'));
  });

  return [
    `const cssByChunkName = ${JSON.stringify(cssByChunkName)};`,
    `export default cssByChunkName`,
  ].join('\n');
};
const buildTheme = async (options) => {
  const { appDir, assetDir } = options;

  const config = await getWebpackConfig(options, assetDir);
  const assetDist = path.join('dist', assetDir);

  const [client] = await webpackPromise(config);
  const stats = await client.toJson('assets');

  if (stats.errors.length) {
    console.log(stats.errors);
  }
  if (stats.warnings.length) {
    console.log(stats.warnings);
  }

  // TODO: emit this through webpack CSSOnlyPlugin
  await mkdir(path.join(appDir, assetDist), { recursive: true });
  await writeFile(
    path.join(appDir, assetDist+'/cssByChunkName.js'),
    prepareCssByChunkName(stats.assetsByChunkName, assetDir)
  );
};

const baseConfig = {
  appDir: path.join(__dirname, '../App'),
  cssFileByChunkNameFile: path.join(__dirname, '../App/dist/cssClassNames.json')
};

const baseTheme = {
  ...baseConfig,
  assetDir: 'assets/base',
  themeDirs: [],
};

const darkTheme = {
  ...baseConfig,
  assetDir: 'assets/dark',
  themeDirs: [
    path.join(__dirname, '../themes/dark'),
  ],
};

const lightTheme = {
  ...baseConfig,
  assetDir: 'assets/light',
  themeDirs: [
    path.join(__dirname, '../themes/light'),
  ],
};

Promise.all([
  buildTheme(baseTheme),
  buildTheme(darkTheme),
  buildTheme(lightTheme),
]);
