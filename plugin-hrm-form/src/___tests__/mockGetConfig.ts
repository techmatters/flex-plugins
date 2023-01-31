/* eslint-disable camelcase */

import { DefinitionVersion, DefinitionVersionId } from 'hrm-form-definitions/src';

const baseMockConfig = {
  hrmBaseUrl: 'http://fake.hrm.com',
  serverlessBaseUrl: 'http://fake.protected.com',
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
    enable_transfers: true,
    enable_save_insights: true,
    enable_counselor_toolkits: true,
  },
  isSupervisor: false,
};

const mockGetConfig = jest.fn(() => baseMockConfig);
const mockGetAseloFeatureFlags = jest.fn(() => baseMockConfig.featureFlags);

jest.mock('../HrmFormPlugin', () => ({
  getConfig: mockGetConfig,
  getDefinitionVersions: jest.fn(),
}));

jest.mock('../hrmConfig', () => ({
  getHrmConfig: mockGetConfig,
  getAseloFeatureFlags: mockGetAseloFeatureFlags,
}));

export const mockPartialConfiguration = partialConfig =>
  mockGetConfig.mockReturnValue({ ...baseMockConfig, ...partialConfig });

export const mockGetDefinitionsResponse = (
  funcToMock: () => any,
  mockVersion: DefinitionVersionId,
  mockFormDefinitions: DefinitionVersion,
) => {
  (<jest.Mock>funcToMock).mockReturnValue({
    currentDefinitionVersion: mockFormDefinitions,
    definitionVersions: { [mockVersion]: mockFormDefinitions },
  });
};
