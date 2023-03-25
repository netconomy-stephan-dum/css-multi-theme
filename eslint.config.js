const config = [
  ...require('@dev/eslint/base.config'),
  {
    ignores: ['**/dist', '.yarn'],
  },
];

module.exports = config;
