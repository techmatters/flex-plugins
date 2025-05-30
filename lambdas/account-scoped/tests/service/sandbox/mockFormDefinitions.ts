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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Mockttp } from 'mockttp';
import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

export const mockFormDefinitions = async (
  mockttp: Mockttp,
  helplineCode: string,
  definitions: DefinitionVersion,
) => {
  await mockttp
    .forGet(/http:\/\/mock-assets-bucket\/form-definitions\/(.*)/)
    .always()
    .thenCallback(async req => {
      const expectedPathRoot = `/form-definitions/${helplineCode}/v1/`;
      if (req.path.startsWith(expectedPathRoot)) {
        const formPath = req.path.slice(expectedPathRoot.length);
        console.debug('Looking up mocked form definition for path:', formPath);
        switch (formPath) {
          case 'tabbedForms/ChildInformationTab.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.tabbedForms.ChildInformationTab),
            };
          case 'tabbedForms/CallerInformationTab.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.tabbedForms.CallerInformationTab),
            };
          case 'tabbedForms/CaseInformationTab.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.tabbedForms.CaseInformationTab),
            };
          case 'HelplineInformation.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.helplineInformation),
            };
          case 'PrepopulateKeys.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.prepopulateKeys),
            };
          case 'PrepopulateMappings.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.prepopulateMappings),
            };
          case 'LayoutDefinitions.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.layoutVersion),
            };
          case 'tabbedForms/IssueCategorizationTab.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.tabbedForms.IssueCategorizationTab('')),
            };
          case 'tabbedForms/ContactlessTaskTab.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.tabbedForms.ContactlessTaskTab),
            };
          case 'insights/oneToManyConfigSpecs.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.insights.oneToManyConfigSpecs),
            };
          case 'insights/oneToOneConfigSpecs.json':
            return {
              statusCode: 200,
              body: JSON.stringify(definitions.insights.oneToOneConfigSpec),
            };
        }
      }
      return {
        statusCode: 200,
        body: '{}',
      };
    });
  console.log(
    `Mocked form definitions on http://mock-assets-bucket/form-definitions/${helplineCode}/v1/`,
  );
};
