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
/* eslint-disable no-restricted-syntax */

import { loadDefinition } from '../../formDefinition';

import { mockFetchDefinitions } from '../fetchDefinitionsMock';
import { loadLocalJson } from '../loadLocalJson';
import { DefinitionVersionId } from '../definitionVersionId';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockFetchDefinitions(loadLocalJson);

beforeEach(() => {
  mockReset();
});

describe('loadDefinition', () => {
  test.each(Object.values(DefinitionVersionId))(
    '%p - successfully loads basic structure',
    async (definitionVersionId: string) => {
      const formDefinitionsBaseUrl = buildBaseURL(definitionVersionId);
      await mockFetchImplementation(formDefinitionsBaseUrl);

      const definitions = await loadDefinition(formDefinitionsBaseUrl);
      expect(definitions.cannedResponses).toBeInstanceOf(Array);
      expect(definitions.callTypeButtons).toContainEqual(expect.anything());
      expect(definitions.tabbedForms).toMatchObject({
        CallerInformationTab: expect.anything(),
        CaseInformationTab: expect.anything(),
        ChildInformationTab: expect.anything(),
        IssueCategorizationTab: expect.any(Function),
      });
      expect(definitions.caseFilters).toBeDefined();
      expect(definitions.caseStatus).toEqual(expect.anything());
      expect(definitions.caseOverview).toBeDefined();
      expect(definitions.layoutVersion).toMatchObject({
        contact: expect.anything(),
        case: expect.anything(),
      });
      expect(definitions.helplineInformation).toMatchObject({
        helplines: expect.arrayContaining([expect.anything()]),
        label: expect.any(String),
      });
      if (definitions.prepopulateMappings) {
        for (const mappings of Object.values(definitions.prepopulateMappings.survey)) {
          const topLevelIsArray = Array.isArray(mappings);
          expect(topLevelIsArray).toBe(true);
          for (const mappingSet of mappings) {
            const lowerLevelIsArray = Array.isArray(mappingSet);
            expect(lowerLevelIsArray).toBe(true);
            for (const mappingEntry of mappingSet) {
              expect(mappingEntry).toMatch(/[a-zA-Z]+\.[a-zA-Z]+/);
            }
          }
        }
      }
    },
  );
});
