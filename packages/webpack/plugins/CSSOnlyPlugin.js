const pluginName = 'CSSOnlyPlugin';

class CSSOnlyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      pluginName,
      async (compilation, callback) => {
        const { chunks } = compilation.getStats().toJson();

        chunks.forEach((chunk) => {
          chunk.files.forEach((file) => {
            if (/\.js$/.test(file)) {
              compilation.deleteAsset(file);
            }
          })
        });

        return callback();
      }
    );
  }
}

module.exports = CSSOnlyPlugin;