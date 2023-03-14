const postcssExport = (moduleMap) => ({
  postcssPlugin: 'extract-export',
  Once (root) {
    root.walkRules(':export', (rule) => {
      if (moduleMap) {
        rule.each(({ prop, value }) => {
          moduleMap[prop] = value;
        });
      }

      rule.remove();
    })
  }
});

postcssExport.postcss = true;

module.exports = postcssExport;
