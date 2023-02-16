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

/**
 * Temporary File !!!!
 * This file will be in place until we move "formDefinitionsUrl" to service configuration
 */
import * as Flex from '@twilio/flex-ui';

/**
 * Returns then environment from the following URL:
 * "https://hrm-{environment}.tl.techmatters.org"
 */
const getEnvironmentFromHrmBaseUrl = (manager: Flex.Manager) => {
  const hrmBaseUrl = `${process.env.REACT_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}`;
  const prefix = 'https://hrm-';
  const suffix = '.tl.techmatters.org';
  const environment = hrmBaseUrl.substring(prefix.length, hrmBaseUrl.indexOf(suffix)).replace('-eu', '');

  /*
   * hrm-test is an alias of hrm-staging that we should deprecate & remove, but some accounts are still configured to point at it
   * This ensures any accounts still pointing at hrm-test go to the right bucket for their assets
   */
  if (environment === 'test') {
    return 'staging';
  }

  return environment;
};

const getHelplineCodeFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'demo-v1') return 'as';
  if (definitionVersionId === 'e2e-v1') return 'e2e';
  if (definitionVersionId === 'v1') return 'zm';

  return definitionVersionId.substring(0, 2);
};

const getVersionFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'v1') return 'v1';

  return definitionVersionId.substring(definitionVersionId.length - 2);
};

export const buildFormDefinitionsBaseUrlGetter = (manager: Flex.Manager) => (definitionVersionId: string) => {
  const environment = getEnvironmentFromHrmBaseUrl(manager);
  const helplineCode = getHelplineCodeFromDefinitionVersionId(definitionVersionId);
  const version = getVersionFromDefinitionVersionId(definitionVersionId);

  return `https://assets-${environment}.tl.techmatters.org/form-definitions/${helplineCode}/${version}`;
};
