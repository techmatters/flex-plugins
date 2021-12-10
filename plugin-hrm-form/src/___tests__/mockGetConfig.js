/* eslint-disable camelcase */
import mockV1 from '../formDefinitions/v1';

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
      configuredLanguage: '',
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
  getDefinitionVersions: jest.fn(() => ({
    currentDefinitionVersion: mockV1,
    definitionVersions: { v1: mockV1 },
  })),
}));
