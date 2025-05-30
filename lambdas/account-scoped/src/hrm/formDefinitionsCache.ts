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
import { DefinitionVersion, loadDefinition } from '@tech-matters/hrm-form-definitions';

const getHelplineCodeFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'demo-v1') return 'as';
  if (definitionVersionId === 'v1') return 'zm';

  return definitionVersionId.split('-')[0];
};

const getVersionFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'v1') return 'v1';

  return definitionVersionId.substring(definitionVersionId.length - 2);
};

export const getFormDefinitionUrl = ({
  assetsBucketUrl,
  definitionVersion,
}: {
  assetsBucketUrl: string;
  definitionVersion: string;
}) => {
  const helplineCode = getHelplineCodeFromDefinitionVersionId(definitionVersion);
  const version = getVersionFromDefinitionVersionId(definitionVersion);
  return `${assetsBucketUrl}/form-definitions/${helplineCode}/${version}`;
};

export const loadedDefinitionVersions: Record<string, DefinitionVersion> = {};

export const getDefinitionVersion = async (
  formDefinitionRootUrl: URL,
): Promise<DefinitionVersion> => {
  const formDefinitionRootUrlString = formDefinitionRootUrl.toString();
  if (!loadedDefinitionVersions[formDefinitionRootUrlString]) {
    console.debug('Loading forms at:', formDefinitionRootUrlString);
    loadedDefinitionVersions[formDefinitionRootUrlString] = await loadDefinition(
      formDefinitionRootUrlString,
    );
  }
  return loadedDefinitionVersions[formDefinitionRootUrlString];
};
/**
 * This function is used to clear the cache of loaded config jsons.
 * This is used for testing purposes.
 */
export const clearDefinitionCache = () => {
  Object.keys(loadedDefinitionVersions).forEach(key => {
    delete loadedDefinitionVersions[key];
  });
};
