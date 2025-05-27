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

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
};

const FORM_DEFINITIONS_PATH = './form-definitions';
const BASE_URL_MOCK = 'http://base_url_mock';

const files = [
  'LayoutDefinitions.json',
  'caseForms/HouseholdForm.json',
  'caseForms/IncidentForm.json',
  'caseForms/NoteForm.json',
  'caseForms/PerpetratorForm.json',
  'caseForms/ReferralForm.json',
  'caseForms/DocumentForm.json',
  'caseForms/ChickenForm.json',
  'tabbedForms/CallerInformationTab.json',
  'tabbedForms/CaseInformationTab.json',
  'tabbedForms/ChildInformationTab.json',
  'tabbedForms/IssueCategorizationTab.json',
  'tabbedForms/ContactlessTaskTab.json',
  'CallTypeButtons.json',
  'CaseSections.json',
  'HelplineInformation.json',
  'CannedResponses.json',
  'insights/oneToOneConfigSpec.json',
  'insights/oneToManyConfigSpecs.json',
  'CaseFilters.json',
  'CaseStatus.json',
  'caseForms/CaseOverview.json',
  'PrepopulateKeys.json',
  'PrepopulateMappings.json',
  'ReferenceData.json',
  'BlockedEmojis.json',
  'profileForms/ProfileOverview.json',
  'profileForms/Sections.json',
  'profileForms/FlagDurations.json',
  'customStrings/Messages.json',
  'customStrings/Substitutions.json',
  'flexUiLocales.json',
];

const getDefinitionVersionId = (formDefinitionsBaseUrl: string) =>
  formDefinitionsBaseUrl.substring(`${BASE_URL_MOCK}/`.length);

// TODO: This should be temporary
const splitDefinitionVersion = (definitionVersionId: string) => {
  if (definitionVersionId === 'v1') {
    return {
      helplineCode: 'zm',
      version: 'v1',
    };
  }

  if (definitionVersionId === 'demo-v1') {
    return {
      helplineCode: 'as',
      version: 'v1',
    };
  }

  // Assumes definitionVersionId is always in the format <helplineCode>-<version>
  const [helplineCode, version] = definitionVersionId.split('-');
  return {
    helplineCode,
    version,
  };
};

// TODO: Refactor to make this more elegant
const mockFetchImplementationGivenSpy = async (
  formDefinitionsBaseUrl: string,
  fetchSpy: jest.SpyInstance,
  jsonLoader: (jsonPath: string) => Promise<any>,
) => {
  const definitionVersionId = getDefinitionVersionId(formDefinitionsBaseUrl);
  const map: { [remotePath: string]: MockResponse } = {};
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const remotePath = `${formDefinitionsBaseUrl}/${file}`;
    const { helplineCode, version } = splitDefinitionVersion(definitionVersionId);
    const localPath = `${FORM_DEFINITIONS_PATH}/${helplineCode}/${version}/${file}`;

    // eslint-disable-next-line no-await-in-loop
    const jsonFile = await jsonLoader(localPath);

    const fileExists = !!jsonFile;
    map[remotePath] = {
      ok: fileExists,
      status: fileExists ? 200 : 404,
      json: () => Promise.resolve(jsonFile),
    };
  }

  fetchSpy.mockImplementation((url) => Promise.resolve(map[url.toString()]));
};

export const mockFetchDefinitions = (jsonLoader: (jsonPath: string) => any) => {
  global.fetch = jest.fn();
  const fetchSpy = jest.spyOn(global, 'fetch');

  const mockFetchImplementation = async (formDefinitionsBaseUrl: string) => {
    return mockFetchImplementationGivenSpy(formDefinitionsBaseUrl, fetchSpy, jsonLoader);
  };

  const buildBaseURL = (definitionVersionId: string) => `${BASE_URL_MOCK}/${definitionVersionId}`;

  const mockReset = () => fetchSpy.mockReset();

  return {
    mockFetchImplementation,
    buildBaseURL,
    mockReset,
  };
};
