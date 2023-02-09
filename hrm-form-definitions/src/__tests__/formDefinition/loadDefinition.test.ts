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

import { DefinitionVersionId, loadDefinition } from '../../formDefinition';

global.fetch = jest.fn();
const fetchSpy = jest.spyOn(global, 'fetch');

const BASE_URL = 'base-url';

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

const loadJSON = async (jsonPath: string) => {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(jsonPath);
  } catch {
    return undefined;
  }
};

// TODO: Refactor to make this more elegant
const mockFetchImplementation = async (
  formDefinitionsBaseUrl: string,
  definitionVersionId: DefinitionVersionId,
) => {
  const map = {};
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const remotePath = `${formDefinitionsBaseUrl}/${file}`;
    const localPath = `../../../form-definitions/${definitionVersionId}/${file}`;

    // eslint-disable-next-line no-await-in-loop
    const jsonFile = await loadJSON(localPath);

    const fileExists = !!jsonFile;
    const mockResponse = {
      ok: fileExists,
      status: fileExists ? 200 : 404,
      json: () => Promise.resolve(jsonFile),
    };

    map[remotePath] = mockResponse;
  }

  fetchSpy.mockImplementation((url) => Promise.resolve(map[url.toString()]));
};

beforeEach(() => {
  fetchSpy.mockReset();
});

describe('loadDefinition', () => {
  test.each(Object.values(DefinitionVersionId))(
    '%p - successfully loads basic structure',
    async (definitionVersionId: DefinitionVersionId) => {
      const formDefinitionsBaseUrl = `${BASE_URL}/${definitionVersionId}`;

      await mockFetchImplementation(formDefinitionsBaseUrl, definitionVersionId);

      const definitions = await loadDefinition(formDefinitionsBaseUrl);
      expect(definitions.cannedResponses).toBeInstanceOf(Array);
      expect(definitions.callTypeButtons).toContainEqual(expect.anything());

      expect(definitions.caseForms).toMatchObject({
        DocumentForm: expect.anything(),
        HouseholdForm: expect.anything(),
        IncidentForm: expect.anything(),
        NoteForm: expect.anything(),
        PerpetratorForm: expect.anything(),
        ReferralForm: expect.anything(),
      });
      expect(definitions.tabbedForms).toMatchObject({
        CallerInformationTab: expect.anything(),
        CaseInformationTab: expect.anything(),
        ChildInformationTab: expect.anything(),
        IssueCategorizationTab: expect.any(Function),
      });
      expect(definitions.caseStatus).toEqual(expect.anything());
      expect(definitions.layoutVersion).toMatchObject({
        contact: expect.anything(),
        case: expect.anything(),
      });
      expect(definitions.helplineInformation).toMatchObject({
        helplines: expect.arrayContaining([expect.anything()]),
        label: expect.any(String),
      });
    },
  );
});
