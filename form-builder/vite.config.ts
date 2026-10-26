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
import { definitionsDevApi } from './server/devApiPlugin';
import { hrmFormDefinitionsResolver } from './build-tools/hrmFormDefinitionsResolver';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const hrmFormDefinitionsSrc = path.resolve(appDir, '../lambdas/packages/hrm-form-definitions/src');
// The Flex plugin's UI text, so the "Try it out" preview uses the same wording as Aselo
const pluginTranslationsDir = path.resolve(appDir, '../plugin-hrm-form/src/translations');

// Defaults to this repo's form definitions; override to point at another checkout
const formDefinitionsDir =
  process.env.FORM_DEFINITIONS_DIR ??
  path.resolve(appDir, '../lambdas/packages/hrm-form-definitions/form-definitions');
// Each helpline's Flex service configuration, for its language
const helplinesConfigDir =
  process.env.HELPLINES_CONFIG_DIR ?? path.resolve(appDir, '../twilio-iac/helplines');

export default defineConfig({
  plugins: [
    hrmFormDefinitionsResolver(hrmFormDefinitionsSrc),
    react(),
    definitionsDevApi(formDefinitionsDir, helplinesConfigDir),
  ],
  resolve: {
    alias: {
      '@hrm-form-definitions': hrmFormDefinitionsSrc,
      '@plugin-translations': pluginTranslationsDir,
    },
  },
  server: {
    port: 5180,
    // The specification, validator and translations are imported from elsewhere in the repo
    fs: { allow: [appDir, hrmFormDefinitionsSrc, pluginTranslationsDir] },
  },
});
