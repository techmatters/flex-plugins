/**
 * Copyright (C) 2021-2026 Technology Matters
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

// Turns the app's TypeScript and JSX into JavaScript, for webpack and for Jest
module.exports = api => {
  const test = api.env('test');
  return {
    presets: [
      // Tests run in Node; the bundle targets current browsers
      ['@babel/preset-env', test ? { targets: { node: 'current' } } : { targets: 'defaults', modules: false }],
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
    plugins: test
      ? [
          // import.meta.url (tests reading files next to them), as Jest runs CommonJS
          'babel-plugin-transform-import-meta',
          // require.context (webpack's) read straight from the files
          './jest/babelRequireContext.cjs',
        ]
      : [],
  };
};
