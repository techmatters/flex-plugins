module.exports = {
  extends: ['airbnb-typescript/base', 'plugin:prettier/recommended'],
  plugins: ['prettier',  'import'],
  rules: {
    'prettier/prettier': ['error'],
    'no-console': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/quotes': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  ignorePatterns: ['coverage/**'],
};
