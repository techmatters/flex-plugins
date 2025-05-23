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

/* eslint-disable no-console */
/**
 * The intention of this file is to test that the form definition files are correct and complying with the specification provided.
 */

import { get } from 'lodash';
import each from 'jest-each';
import { validateFormDefinition, validateCategoriesDefinition } from '../../specification/validate';
import {
  aseloFormTemplates,
  CategoriesDefinition,
  DefinitionSpecification,
  DefinitionVersion,
  FormDefinition,
  FormFileSpecification,
  loadDefinition,
} from '../../index';
import { mockFetchDefinitions } from '../fetchDefinitionsMock';
import { loadLocalJson } from '../loadLocalJson';
import { DefinitionVersionId } from '../definitionVersionId';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockFetchDefinitions(loadLocalJson);

/**
 * Given a DefinitionSpecification and a CategoriesDefinition, will expect that the CategoriesDefinition is valid under the DefinitionSpecification.
 */
const testCategoriesDefinition =
  (definitionVersionId: string, specificationPath: string) =>
  (specification: DefinitionSpecification, definition: CategoriesDefinition) => {
    const result = validateCategoriesDefinition(specification, definition);

    if (!result.valid)
      // eslint-disable-next-line no-console
      console.error(
        `Error: invalid definition on ${specificationPath} for definition ${definitionVersionId}`,
        JSON.stringify(result.issues, null, 2),
      );

    expect(result.valid).toBe(true);
  };

/**
 * Given a FormFileSpecification and a FormDefinition, will expect that the FormDefinition is valid under the FormFileSpecification.
 */
const testFormFileSpecification =
  (definitionVersionId: string, specificationPath: string) =>
  (specification: FormFileSpecification, definition: FormDefinition) => {
    const result = validateFormDefinition(specification, definition);

    if (!result.valid) {
      const failingItemReports = Object.entries(result.itemReports).reduce(
        (accum, [item, report]) => (report.valid ? accum : { ...accum, [item]: report }),
        {},
      );

      console.error(
        `Error: invalid definition on ${specificationPath} for definition ${definitionVersionId}`,
        JSON.stringify(failingItemReports, null, 2),
      );
    }
    return result;
  };

describe('Validate form definitions', () => {
  const definitionVersionsIds = Object.values(DefinitionVersionId).map((definitionId) => ({
    definitionId,
  }));

  each(definitionVersionsIds).describe(
    'Testing definition for $definitionId',
    ({ definitionId }) => {
      let definitionVersion: DefinitionVersion;
      let categoriesDefinitions: { helpline: string; categoriesDefinition: CategoriesDefinition }[];
      let layoutDefinition: DefinitionVersion['layoutVersion'];

      beforeEach(async () => {
        mockReset();

        const formDefinitionsBaseUrl = buildBaseURL(definitionId);
        await mockFetchImplementation(formDefinitionsBaseUrl);

        definitionVersion = await loadDefinition(formDefinitionsBaseUrl);
        const helplines = definitionVersion.helplineInformation.helplines.map((h) => h.value);
        categoriesDefinitions = helplines.map((helpline) => ({
          helpline,
          categoriesDefinition: definitionVersion.tabbedForms.IssueCategorizationTab(helpline),
        }));
        layoutDefinition = definitionVersion.layoutVersion;
      });

      const formFileSpecificationPaths = [
        'tabbedForms.CallerInformationTab',
        'tabbedForms.CaseInformationTab',
        'tabbedForms.ChildInformationTab',
        'callTypeButtons',
      ];

      each(formFileSpecificationPaths.map((path) => ({ path }))).test(
        'Validating form definition $path',
        ({ path }) => {
          const assertFun = testFormFileSpecification(definitionId, path);
          const specification = get(aseloFormTemplates, path);
          const definition = get(definitionVersion, path);

          const result = assertFun(specification, definition);
          expect(result).toEqual({
            valid: true,
            issues: [],
            itemReports: expect.anything(),
          });
        },
      );

      test('Validating case section form definitions', () => {
        Object.entries(definitionVersion.caseSectionTypes).forEach(
          ([sectionType, sectionTypeInfo]) => {
            const assertFun = testFormFileSpecification(definitionId, sectionType);
            const specification: FormFileSpecification = { definitionFilePath: '', items: {} };
            const definition = sectionTypeInfo.form;

            const result = assertFun(specification, definition);
            expect(result).toEqual({
              valid: true,
              issues: [],
              itemReports: expect.anything(),
            });
          },
        );
      });

      // Would like to 'each' per helpline, but jest doesn't support loading an array for pass to the 'each' function asynchronously
      // See https://github.com/facebook/jest/issues/9709
      test('Validating categories for all helplines', () => {
        categoriesDefinitions.forEach(({ helpline, categoriesDefinition }) => {
          const assertFun = testCategoriesDefinition(
            definitionId,
            `tabbedForms.IssueCategorizationTab (helpline ${helpline})`,
          );

          assertFun(aseloFormTemplates.tabbedForms.IssueCategorizationTab, categoriesDefinition);
        });
      });

      test('Validating layoutDefinition', () => {
        const {
          case: {
            sectionTypes: {
              incident: { previewFields, layout },
            },
          },
        } = layoutDefinition;
        expect(Array.isArray(previewFields)).toBe(true);
        previewFields.forEach((pf) => expect(typeof pf).toBe('string'));
        expect(Array.isArray(previewFields)).toBe(true);
        if (previewFields.length) {
          expect(layout).toBeDefined();
          previewFields.forEach((pf) => {
            expect(typeof layout[pf]).toBe('object');
          });
        }
      });

      test('Validating required fields in caseOverview definition', () => {
        const requiredFields = ['status'];

        expect(definitionVersion.caseOverview).toBeDefined();

        const caseOverviewItems = Array.isArray(definitionVersion.caseOverview)
          ? definitionVersion.caseOverview
          : Object.values(definitionVersion.caseOverview);

        const caseOverviewFieldNames = caseOverviewItems.map((item) => item.name);

        requiredFields.forEach((field) => {
          expect(caseOverviewFieldNames).toContain(field);
        });

        caseOverviewItems
          .filter((item) => item.name !== 'status')
          .forEach((item) => {
            const assertFun = testFormFileSpecification(definitionId, `caseOverview.${item.name}`);
            const specification = { definitionFilePath: '', items: {} };
            const definition = item.form || [item];

            const result = assertFun(specification, definition);
            expect(result).toEqual({
              valid: true,
              issues: [],
              itemReports: expect.anything(),
            });
          });
      });
    },
  );
});
