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

/**
 * The same as the webchat's (aselo-webchat-react-app/.eslintrc.json), with a few changes for this
 * app, each saying why.
 */
module.exports = {
  extends: ['twilio-react', 'plugin:react/jsx-runtime', 'plugin:sonarjs/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    // The workspace packages (@tech-matters/form-builder-shared...) and the client's aliases
    'import/resolver': {
      typescript: { project: ['client/tsconfig.json', 'server/tsconfig.json', 'shared/tsconfig.json'] },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  rules: {
    'no-console': 'off',
    'no-warning-comments': 'off',
    'multiline-comment-style': 'off',
    'no-confusing-arrow': 'off',
    'no-alert': 'off',
    'no-shadow': 'off',
    'import/no-extraneous-dependencies': 'off',
    'jsx-a11y/tabindex-no-positive': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'no-use-before-define': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/require-default-props': 'off',
    'react/no-unused-prop-types': 'off',
    'react/default-props-match-prop-types': 'off',
    'react/no-multi-comp': 'off',
    'react/jsx-no-bind': 'off',
    'sonarjs/no-nested-template-literals': 'off',
    'sonar/unused-import': 'off',
    // TypeScript's constructor parameter properties (constructor(private readonly x) {}) aren't
    // useless or empty: the TypeScript versions of these rules know that
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    // Names in formats the builder doesn't own (OAuth with Okta, Flex's service configuration,
    // GitHub's API) are as those formats spell them
    camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],
    // A label wrapping its control is associated with it: no need for htmlFor and an id as well
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either', depth: 25 }],
  },
};
