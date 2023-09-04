const tsConfig = require('@dev/eslint/ts.config');
const baseConfig = require('@dev/eslint/base.config');
const cjsConfig = require('@dev/eslint/cjs.config');

module.exports = [...baseConfig, ...tsConfig, cjsConfig];
