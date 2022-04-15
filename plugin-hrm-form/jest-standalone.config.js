// For rapidly running non flex UI dependent tests locally
const { defaults } = require('jest-config');

module.exports = config => {
  config = config || {
    ...defaults,
    rootDir: '.',
    setupFiles: ['./src/setupTests.js'],
    testEnvironment: 'jest-environment-jsdom-latest',
    testTimeout: 2 * 60 * 1000, // 2 minutes in ms
  };

  return config;
};
