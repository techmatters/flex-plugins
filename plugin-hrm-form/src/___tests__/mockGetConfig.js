import mockV1 from '../formDefinitions/v1';

jest.mock('../HrmFormPlugin', () => ({
  getConfig: () => {
    return {
      hrmBaseUrl: '',
      serverlessBaseUrl: '',
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
      strings: {
        'Error-CategoryRequired': 'Required 1 category minimum, 3 categories maximum',
        'ContactDetails-GeneralDetails': 'General Details',
        'TabbedForms-AddCallerInfoTab': 'Caller Information',
        'TabbedForms-AddChildInfoTab': 'Child Information',
        'TabbedForms-CategoriesTab': 'Categories',
        'TabbedForms-AddCaseInfoTab': 'Summary',
      },
    };
  },
  getFormsVersions: jest.fn(() => ({
    currentDefinitionVersion: mockV1,
  })),
}));
