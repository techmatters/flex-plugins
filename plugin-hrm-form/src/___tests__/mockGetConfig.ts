/* eslint-disable camelcase */

import { DefinitionVersion, DefinitionVersionId } from 'hrm-form-definitions/src';

jest.mock('../HrmFormPlugin', () => ({
  getConfig: () => {
    return {
      hrmBaseUrl: '',
      serverlessBaseUrl: '',
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
      },
    };
  },
  getDefinitionVersions: jest.fn(),
}));

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
