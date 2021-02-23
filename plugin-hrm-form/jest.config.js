module.exports = (config, { isProd, isDev, isTest }) => {
  config.transformIgnorePatterns = ['/node_modules/(?!wavesurfer.js)'];

  return config;
};
