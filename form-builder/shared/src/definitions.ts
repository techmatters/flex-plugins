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
 * A helpline's definition files as the API returns them (server/src/definitionsApi.ts reads them).
 */
import type { ImportSource } from './branches.ts';

export type HelplineSummary = {
  code: string;
  versions: string[];
};

export type DefinitionFileError = {
  path: string;
  message: string;
};

export type DefinitionFiles = {
  code: string;
  version: string;
  // e.g. { 'tabbedForms/CallerInformationTab.json': [...] }
  files: Record<string, unknown>;
  errors: DefinitionFileError[];
  // From the helpline's Flex service configuration, e.g. 'en-US' (decides the UI wording)
  helplineLanguage?: string;
  // Logo for Flex's header, if the helpline's production config sets one
  logoUrl?: string;
  // Production feature flags, e.g. enable_canned_responses
  featureFlags?: Record<string, boolean>;
  // The helpline's webchat settings, when it has a webchat (aselo-webchat-react-app/configSrc)
  webchat?: WebchatSettings;
  // The service configuration every helpline starts from (twilio-iac/helplines/configs/
  // service-configuration/defaults.json). Read-only here; Aselo staff only, like the helpline's
  // own service configuration files (service-configuration/*.json in files).
  serviceConfigDefaults?: Record<string, unknown>;
  // The flex-plugins branch they were read from, when not the default (server/src/branches.ts)
  source?: ImportSource;
};

export type WebchatSettings = {
  // The language the webchat opens in, e.g. 'en-US'
  defaultLocale: string;
  // The pre-engagement field whose answer identifies the contact (e.g. an email field)
  contactIdentifierField?: string;
};
