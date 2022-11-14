module.exports = (config, { isProd, isDev, isTest }) => {
  config.transformIgnorePatterns = ['/node_modules/(?!wavesurfer.js)'];
  config.testEnvironment = 'jsdom';
  return config;
};
