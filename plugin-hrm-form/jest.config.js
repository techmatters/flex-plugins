module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!wavesurfer.js)'],
  transform: {
    '(js|jsx)': 'babel-jest',
    '.(ts|tsx)': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: ['./src/setupTests.js'],
};
