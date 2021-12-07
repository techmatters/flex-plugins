// For rapidly running non flex UI dependent tests locally

const { defaults } = require('jest-config');

module.exports = config => {
  config = config || { ...defaults, rootDir: '.' };
  config.transformIgnorePatterns = ['/node_modules/(?!wavesurfer.js)'];

  return config;
};
