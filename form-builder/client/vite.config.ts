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

import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// (A relative import, so Vite bundles it with this config: Node can't load the server's TypeScript)
import { definitionsDevApi } from '../server/src/devApiPlugin';
import { hrmFormDefinitionsResolver } from './build-tools/hrmFormDefinitionsResolver';

const appDir = path.dirname(fileURLToPath(import.meta.url));
// form-builder/ (where local drafts are kept) and the repo it's in
const builderDir = path.resolve(appDir, '..');
const repoDir = path.resolve(builderDir, '..');
const hrmFormDefinitionsSrc = path.resolve(repoDir, 'lambdas/packages/hrm-form-definitions/src');
// The Flex plugin's UI text, so the "Try it out" preview uses the same wording as Aselo
const pluginTranslationsDir = path.resolve(repoDir, 'plugin-hrm-form/src/translations');
// The plugin's feature flags, whose comments describe them on the Service configuration page
const pluginTypesDir = path.resolve(repoDir, 'plugin-hrm-form/src/types');

// Defaults to this repo's form definitions; override to point at another checkout
const formDefinitionsDir =
  process.env.FORM_DEFINITIONS_DIR ??
  path.resolve(repoDir, 'lambdas/packages/hrm-form-definitions/form-definitions');
// Each helpline's Flex service configuration, for its language
const helplinesConfigDir =
  process.env.HELPLINES_CONFIG_DIR ?? path.resolve(repoDir, 'twilio-iac/helplines');
// The webchat app's per-helpline settings and translations
const webchatConfigDir =
  process.env.WEBCHAT_CONFIG_DIR ?? path.resolve(repoDir, 'aselo-webchat-react-app/configSrc');
// The webchat app's own text, for the webchat form preview
const webchatTranslationsDir = path.resolve(repoDir, 'aselo-webchat-react-app/translationsSrc');

export default defineConfig({
  plugins: [
    hrmFormDefinitionsResolver(hrmFormDefinitionsSrc),
    react(),
    definitionsDevApi({
      formDefinitionsDir,
      helplinesConfigDir,
      webchatConfigDir,
      // Work in progress, kept out of git; deployed, drafts live in a private S3 bucket
      draftsDir: process.env.FORM_BUILDER_DRAFTS_DIR ?? path.resolve(builderDir, 'drafts'),
      repoRoot: repoDir,
    }),
  ],
  resolve: {
    alias: {
      '@hrm-form-definitions': hrmFormDefinitionsSrc,
      '@plugin-translations': pluginTranslationsDir,
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries change less often than the app, so they're cached separately
        manualChunks: {
          vendor: ['react', 'react-dom', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'jszip'],
        },
      },
    },
  },
  server: {
    port: 5180,
    // The specification, validator and translations are imported from elsewhere in the repo
    fs: { allow: [builderDir, hrmFormDefinitionsSrc, pluginTranslationsDir, pluginTypesDir, webchatTranslationsDir] },
  },
});
