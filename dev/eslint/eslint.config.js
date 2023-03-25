const baseConfig = require('./base.config');
const cjsConfig = require('./cjs.config');

const config = [...baseConfig, cjsConfig];

module.exports = config;
