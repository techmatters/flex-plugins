/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

module.exports = {
  extends: ['airbnb-typescript/base', 'plugin:prettier/recommended'],
  plugins: ['prettier', 'jest', 'import'],
  rules: {
    'prettier/prettier': ['error'],
    'no-console': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/quotes': 'off',
    'import/prefer-default-export': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  env: {
    'jest/globals': true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  ignorePatterns: [
    'cdk.out/**',
    '**/dist/**',
    '**/*-dist/**',
    '**/coverage/**',
    'node_modules/**',
    '**/node_modules/**',
  ],
};
