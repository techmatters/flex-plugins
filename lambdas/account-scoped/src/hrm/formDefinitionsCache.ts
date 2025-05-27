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

export const loadedConfigJsons: Record<string, any> = {};

export const loadConfigJson = async (
  formDefinitionRootUrl: URL,
  section: string,
): Promise<any> => {
  const url = `${formDefinitionRootUrl}/${section}.json`;
  if (!loadedConfigJsons[url]) {
    console.debug('Loading forms at:', url);
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No config json found at ${url}`);
        return null;
      }
      throw new Error(
        `Failed to load config json from ${url}: Status ${response.status} - ${response.statusText}\r\n${await response.text()}`,
      );
    }
    loadedConfigJsons[url] = await response.json();
  }
  return loadedConfigJsons[url];
};
/**
 * This function is used to clear the cache of loaded config jsons.
 * This is used for testing purposes.
 */
export const clearDefinitionCache = () => {
  Object.keys(loadedConfigJsons).forEach(key => {
    delete loadedConfigJsons[key];
  });
};
