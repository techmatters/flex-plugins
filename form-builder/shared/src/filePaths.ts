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

export const isWebchatTranslationsPath = (filePath: string) => filePath.startsWith(WEBCHAT_TRANSLATIONS_PREFIX);

// e.g. 'webchat-app/translations/en-US.json' -> 'en-US'
export const webchatLocaleOf = (filePath: string) =>
  filePath.slice(WEBCHAT_TRANSLATIONS_PREFIX.length).replace(/\.json$/, '');

/**
 * The helpline's Flex service configuration (twilio-iac/helplines/<code>/configs/service-configuration),
 * keyed under `service-configuration/`: common.json and one file per environment, exactly as in
 * the repo. Only Aselo staff see or change them. Applying them to Twilio stays a separate step
 * (make service-config-plan / service-config-apply).
 */
export const SERVICE_CONFIG_PREFIX = 'service-configuration/';
export const SERVICE_CONFIG_FILE_NAMES = ['common', 'staging', 'production', 'development'] as const;
export type ServiceConfigFileName = (typeof SERVICE_CONFIG_FILE_NAMES)[number];

export const isServiceConfigPath = (filePath: string) => filePath.startsWith(SERVICE_CONFIG_PREFIX);
export const serviceConfigPath = (name: ServiceConfigFileName) => `${SERVICE_CONFIG_PREFIX}${name}.json`;

export const repoServiceConfigDir = (code: string) => `twilio-iac/helplines/${code}/configs/service-configuration`;

/**
 * The helpline's operating hours (lambdas/account-scoped/src/operatingInfo/<code>.json), read by
 * the account-scoped Lambda's operatingHours route, keyed as `account-scoped/operatingInfo.json`.
 * Only Aselo staff change it (helpline staff see it), and a change ships with an account-scoped
 * Lambda deploy.
 */
export const REPO_OPERATING_INFO_DIR = 'lambdas/account-scoped/src/operatingInfo';
export const OPERATING_INFO_FILE = 'account-scoped/operatingInfo.json';

export const isOperatingInfoPath = (filePath: string) => filePath === OPERATING_INFO_FILE;

/**
 * The helpline's HRM permissions: a rules file in the hrm repo (hrm-domain/hrm-core/permission-rules/
 * <name>.json), named by permission_config in the helpline's .hcl files (usually its code; some
 * helplines share one), keyed as `hrm-permission-rules/<name>.json`. Only Aselo staff change it
 * (helpline staff see it). It's for another repo: flex-plugins PRs leave it out, it's downloaded
 * for the hrm repo instead, and a change ships with an HRM deploy.
 */
export const HRM_PERMISSION_RULES_PREFIX = 'hrm-permission-rules/';
export const REPO_HRM_PERMISSION_RULES_DIR = 'hrm-domain/hrm-core/permission-rules';

export const isPermissionRulesPath = (filePath: string) => filePath.startsWith(HRM_PERMISSION_RULES_PREFIX);
export const permissionRulesPath = (name: string) => `${HRM_PERMISSION_RULES_PREFIX}${name}.json`;
// e.g. 'hrm-permission-rules/usnm.json' -> 'usnm'
export const permissionRulesNameOf = (filePath: string) =>
  filePath.slice(HRM_PERMISSION_RULES_PREFIX.length).replace(/\.json$/, '');

// Files that live in another repo (hrm), so not in flex-plugins PRs
export const isOtherRepoPath = (filePath: string) => isPermissionRulesPath(filePath);

// Files only Aselo staff change: the service configuration, the operating hours and the permissions
export const isStaffOnlyPath = (filePath: string) =>
  isServiceConfigPath(filePath) || isOperatingInfoPath(filePath) || isPermissionRulesPath(filePath);

// Of those, the ones helpline staff don't even see (the operating hours and permissions they see, review and
// comment on)
export const isHiddenFromHelplinePath = (filePath: string) => isServiceConfigPath(filePath);

// Where a file goes, from the root of its repo; files for the hrm repo under hrm/ (as in the zip)
export const repoPathOf = (code: string, version: string, filePath: string) => {
  if (isPermissionRulesPath(filePath)) {
    return `hrm/${REPO_HRM_PERMISSION_RULES_DIR}/${filePath.slice(HRM_PERMISSION_RULES_PREFIX.length)}`;
  }
  if (isOperatingInfoPath(filePath)) return `${REPO_OPERATING_INFO_DIR}/${code}.json`;
  if (isServiceConfigPath(filePath)) {
    return `${repoServiceConfigDir(code)}/${filePath.slice(SERVICE_CONFIG_PREFIX.length)}`;
  }
  return isWebchatTranslationsPath(filePath)
    ? `${REPO_WEBCHAT_CONFIG_DIR}/${code}/translations/${filePath.slice(WEBCHAT_TRANSLATIONS_PREFIX.length)}`
    : `${REPO_FORM_DEFINITIONS_DIR}/${code}/${version}/${filePath}`;
};
