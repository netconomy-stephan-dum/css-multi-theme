const tsConfig = require('@dev/eslint/ts.config');
const baseConfig = require('@dev/eslint/base.config');

module.exports = [...baseConfig, ...tsConfig];
