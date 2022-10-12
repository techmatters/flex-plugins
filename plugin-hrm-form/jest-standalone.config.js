// For rapidly running non flex UI dependent tests locally
const { defaults } = require('jest-config');

module.exports = config => {
  config = config || {
    ...defaults,
    rootDir: '.',
    setupFilesAfterEnv: ['./src/setupTests.js'],
    testEnvironment: 'jest-environment-jsdom',
    testTimeout: 2 * 60 * 1000, // 2 minutes in ms
    transformIgnorePatterns: [`/node_modules/(?!uuid/.+\\.js)`],
    moduleNameMapper: {
      "\\.css$": "identity-obj-proxy"
    }
  };

  return config;
};
