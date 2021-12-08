// For rapidly running non flex UI dependent tests locally
const { defaults } = require('jest-config');

module.exports = config => {
  config = config || {
    ...defaults,
    rootDir: '.',
    transformIgnorePatterns: ['/node_modules/(?!wavesurfer.js)'],
    setupFiles: ['./src/setupTests.js'],
    testEnvironment: 'jsdom',
    testTimeout: 2 * 60 * 1000, // 2 minutes in ms
  };

  return config;
};
