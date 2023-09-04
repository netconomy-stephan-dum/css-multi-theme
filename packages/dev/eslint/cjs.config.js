const cjsConfig = {
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      __dirname: true,
      console: true,
      process: true,

    },
    sourceType: 'commonjs',
  },
  rules: {
    strict: 'off',
  },
};

module.exports = cjsConfig;
