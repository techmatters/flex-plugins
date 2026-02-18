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

const getHelplineCodeFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'demo-v1') return 'as';
  if (definitionVersionId === 'v1') return 'zm';

  return definitionVersionId.split('-')[0];
};

const getVersionFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'v1') return 'v1';

  return definitionVersionId.substring(definitionVersionId.length - 2);
};

export const buildFormDefinitionsBaseUrlGetter =
  ({
    environment,
    configuredFormDefinitionsBaseUrl,
  }: {
    environment: string;
    configuredFormDefinitionsBaseUrl?: string;
  }) =>
  (definitionVersionId: string) => {
    const helplineCode = getHelplineCodeFromDefinitionVersionId(definitionVersionId);
    const version = getVersionFromDefinitionVersionId(definitionVersionId);
    let baseUrl: string =
      configuredFormDefinitionsBaseUrl ||
      `https://assets-${environment}.tl.techmatters.org/form-definitions/`;
    if (!baseUrl.endsWith('/')) {
      baseUrl = `${baseUrl}/`;
    }
    return `${baseUrl}${helplineCode}/${version}`;
  };
