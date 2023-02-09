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

import type { DefinitionVersionId } from '../formDefinition';

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
};

const FORM_DEFINITIONS_PATH = '../../form-definitions';
const BASE_URL_MOCK = 'BASE_URL_MOCK';

const files = [
  'LayoutDefinitions.json',
  'caseForms/HouseholdForm.json',
  'caseForms/IncidentForm.json',
  'caseForms/NoteForm.json',
  'caseForms/PerpetratorForm.json',
  'caseForms/ReferralForm.json',
  'caseForms/DocumentForm.json',
  'tabbedForms/CallerInformationTab.json',
  'tabbedForms/CaseInformationTab.json',
  'tabbedForms/ChildInformationTab.json',
  'tabbedForms/IssueCategorizationTab.json',
  'tabbedForms/ContactlessTaskTab.json',
  'CallTypeButtons.json',
  'HelplineInformation.json',
  'CannedResponses.json',
  'insights/oneToOneConfigSpec.json',
  'insights/oneToManyConfigSpecs.json',
  'CaseStatus.json',
  'PrepopulateKeys.json',
  'ReferenceData.json',
  'BlockedEmojis.json',
];

const getDefinitionVersionId = (formDefinitionsBaseUrl: string) =>
  formDefinitionsBaseUrl.substring(`${BASE_URL_MOCK}/`.length);

const loadJSON = async (jsonPath: string) => {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(jsonPath);
  } catch {
    return undefined;
  }
};

// TODO: Refactor to make this more elegant
const mockFetchImplementationGivenSpy = async (
  formDefinitionsBaseUrl: string,
  fetchSpy: jest.SpyInstance,
) => {
  const definitionVersionId = getDefinitionVersionId(formDefinitionsBaseUrl);
  const map: { [remotePath: string]: MockResponse } = {};
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const remotePath = `${formDefinitionsBaseUrl}/${file}`;
    const localPath = `${FORM_DEFINITIONS_PATH}/${definitionVersionId}/${file}`;

    // eslint-disable-next-line no-await-in-loop
    const jsonFile = await loadJSON(localPath);

    const fileExists = !!jsonFile;
    const mockResponse: MockResponse = {
      ok: fileExists,
      status: fileExists ? 200 : 404,
      json: () => Promise.resolve(jsonFile),
    };

    map[remotePath] = mockResponse;
  }

  fetchSpy.mockImplementation((url) => Promise.resolve(map[url.toString()]));
};

export const useFetchDefinitions = () => {
  global.fetch = jest.fn();
  const fetchSpy = jest.spyOn(global, 'fetch');

  const mockFetchImplementation = async (formDefinitionsBaseUrl: string) => {
    return mockFetchImplementationGivenSpy(formDefinitionsBaseUrl, fetchSpy);
  };

  const buildBaseURL = (definitionVersionId: DefinitionVersionId) =>
    `${BASE_URL_MOCK}/${definitionVersionId}`;

  const mockReset = () => fetchSpy.mockReset();

  return {
    mockFetchImplementation,
    buildBaseURL,
    mockReset,
  };
};
