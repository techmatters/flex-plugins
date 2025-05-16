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

/* eslint-disable camelcase */

import { DefinitionVersion } from 'hrm-form-definitions';

export const baseMockConfig = {
  accountSid: 'ACfake',
  hrmBaseUrl: 'http://fake.hrm.com',
  lambdaBaseUrl: 'http://fake.hrm.com',
  hrmMicroserviceBaseUrl: 'http://fake.hrm.com',
  serverlessBaseUrl: 'http://fake.protected.com',
  assetsBucketUrl: 'http://assets.fake.com',
  serviceSid: '',
  workerSid: '',
  helpline: '',
  currentWorkspace: '',
  counselorLanguage: '',
  helplineLanguage: '',
  identity: '',
  token: '',
  counselorName: '',
  definitionVersion: 'v1',
  permissionConfig: 'zm',
  strings: {
    'Error-CategoryRequired': 'Required 1 category minimum, 3 categories maximum',
    'ContactDetails-GeneralDetails': 'General Details',
    'TabbedForms-AddCallerInfoTab': 'Caller Information',
    'TabbedForms-AddChildInfoTab': 'Child Information',
    'TabbedForms-CategoriesTab': 'Categories',
    'TabbedForms-AddCaseInfoTab': 'Summary',
  },
  featureFlags: {
    enable_save_insights: true,
    enable_counselor_toolkits: true,
    enable_permissions_from_backend: true,
  },
  isSupervisor: false,
};

const mockGetConfig = jest.fn(() => baseMockConfig);
const mockGetAseloFeatureFlags = jest.fn(() => baseMockConfig.featureFlags);
const mockGetResourceStrings = jest.fn(() => baseMockConfig.strings);

jest.mock('../hrmConfig', () => ({
  getHrmConfig: mockGetConfig,
  getAseloFeatureFlags: mockGetAseloFeatureFlags,
  getTemplateStrings: mockGetResourceStrings,
  initializeConfig: jest.fn(),
  getDefinitionVersions: jest.fn(),
}));

export const mockPartialConfiguration = partialConfig =>
  mockGetConfig.mockReturnValue({ ...baseMockConfig, ...partialConfig });

export const mockGetDefinitionsResponse = (
  funcToMock: () => any,
  mockVersion: string,
  mockFormDefinitions: DefinitionVersion,
) => {
  (<jest.Mock>funcToMock).mockReturnValue({
    currentDefinitionVersion: mockFormDefinitions,
    definitionVersions: { [mockVersion]: mockFormDefinitions },
  });
};
