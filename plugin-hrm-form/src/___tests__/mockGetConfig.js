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
}));
