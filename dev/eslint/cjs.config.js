const cjsConfig = {
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      __dirname: true,
      process: true,
    },
    sourceType: 'commonjs',
  },
  rules: {
    strict: 'off',
  },
};

module.exports = cjsConfig;
