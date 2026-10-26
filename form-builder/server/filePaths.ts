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
 * Where a draft's files live in the repo. Shared by the server and the browser, so no Node
 * imports here.
 *
 * Most files are form definitions, keyed by their path in the version directory. The
 * webchat's translations live in the webchat app instead; they're keyed under
 * `webchat-app/translations/` so they travel in the same draft. They belong to the helpline
 * rather than to a form definition version.
 */
export const REPO_FORM_DEFINITIONS_DIR = 'lambdas/packages/hrm-form-definitions/form-definitions';
export const REPO_WEBCHAT_CONFIG_DIR = 'aselo-webchat-react-app/configSrc';

export const WEBCHAT_TRANSLATIONS_PREFIX = 'webchat-app/translations/';

export const isWebchatTranslationsPath = (filePath: string) =>
  filePath.startsWith(WEBCHAT_TRANSLATIONS_PREFIX);

// e.g. 'webchat-app/translations/en-US.json' -> 'en-US'
export const webchatLocaleOf = (filePath: string) =>
  filePath.slice(WEBCHAT_TRANSLATIONS_PREFIX.length).replace(/\.json$/, '');

/**
 * Helpline features (client profiles, canned responses...) live in the helpline's Flex service
 * configuration. Drafts only carry the switches, in this file; applying writes them there.
 */
export const FEATURES_FILE = 'aselo-features.json';

export type HelplineFeatures = {
  enableClientProfiles: boolean;
  enableCannedResponses: boolean;
  usePrepopulateMappings: boolean;
};

export const repoServiceConfigDir = (code: string) => `twilio-iac/helplines/${code}/configs/service-configuration`;

export const repoPathOf = (code: string, version: string, filePath: string) => {
  if (filePath === FEATURES_FILE) return `${repoServiceConfigDir(code)}/ (helpline features)`;
  return isWebchatTranslationsPath(filePath)
    ? `${REPO_WEBCHAT_CONFIG_DIR}/${code}/translations/${filePath.slice(WEBCHAT_TRANSLATIONS_PREFIX.length)}`
    : `${REPO_FORM_DEFINITIONS_DIR}/${code}/${version}/${filePath}`;
};
