import PropTypes from 'prop-types';

export const taskType = PropTypes.shape({
  taskSid: PropTypes.string,
});

export const fieldType = PropTypes.shape({
  value: PropTypes.string,
  error: PropTypes.string,
  validation: PropTypes.string,
  touched: PropTypes.bool,
});

const callTypeType = PropTypes.shape({
  value: PropTypes.string,
});

const nameType = PropTypes.shape({
  firstName: fieldType,
  lastName: fieldType,
});

const locationType = PropTypes.shape({
  streetAddress: fieldType,
  city: fieldType,
  stateOrCounty: fieldType,
  postalCode: fieldType,
  phone1: fieldType,
  phone2: fieldType,
});

const schoolType = PropTypes.shape({
  name: fieldType,
  gradeLevel: fieldType,
});

const categoryType = PropTypes.arrayOf(fieldType);

const categoriesType = PropTypes.shape({
  error: PropTypes.string,
  validation: PropTypes.string,
  touched: PropTypes.bool,
  categories: PropTypes.arrayOf(categoryType),
});

const childInformationType = PropTypes.shape({
  name: nameType,
  gender: fieldType,
  age: fieldType,
  language: fieldType,
  nationality: fieldType,
  ethnicity: fieldType,
  school: schoolType,
  location: locationType,
  refugee: fieldType,
  disabledOrSpecialNeeds: fieldType,
  hiv: fieldType,
});

const callerInformationType = PropTypes.shape({
  name: nameType,
  relationshipToChild: fieldType,
  gender: fieldType,
  age: fieldType,
  language: fieldType,
  nationality: fieldType,
  ethnicity: fieldType,
  location: locationType,
});

const caseInformationType = PropTypes.shape({
  categories: categoriesType,
  callSummary: fieldType,
  referredTo: fieldType,
  status: fieldType,
  keepConfidential: fieldType,
  okForCaseWorkerToCall: fieldType,
  howDidTheChildHearAboutUs: fieldType,
  didYouDiscussRightsWithTheChild: fieldType,
  didTheChildFeelWeSolvedTheirProblem: fieldType,
  wouldTheChildRecommendUsToAFriend: fieldType,
});

export const formType = PropTypes.shape({
  callType: callTypeType,
  callerInformation: callerInformationType,
  childInformation: childInformationType,
  caseInformation: caseInformationType,
});

export const contextObject = PropTypes.shape({
  hrmBaseUrl: PropTypes.string.isRequired,
  serverlessBaseUrl: PropTypes.string.isRequired,
  workerSid: PropTypes.string.isRequired,
  helpline: PropTypes.string.isRequired,
  currentWorkspace: PropTypes.string.isRequired,
  getSsoToken: PropTypes.func.isRequired,
});

export const searchContactResult = PropTypes.shape({
  contactId: PropTypes.string.isRequired,
  overview: PropTypes.shape({
    dateTime: PropTypes.string,
    name: PropTypes.string,
    customerNumber: PropTypes.string,
    callType: PropTypes.string,
    categories: PropTypes.string,
    counselor: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired,
  details: PropTypes.shape({
    childInformation: PropTypes.shape({
      name: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
      }),
      gender: PropTypes.string,
      age: PropTypes.string,
      language: PropTypes.string,
      nationality: PropTypes.string,
      ethnicity: PropTypes.string,
      location: PropTypes.shape({
        streetAddress: PropTypes.string,
        city: PropTypes.string,
        stateOrCounty: PropTypes.string,
        postalCode: PropTypes.string,
        phone1: PropTypes.string,
        phone2: PropTypes.string,
      }),
      refugee: PropTypes.bool,
    }),
    caseInformation: PropTypes.shape({
      callSummary: PropTypes.string,
      referredTo: PropTypes.string,
      status: PropTypes.string,
      keepConfidential: PropTypes.bool,
      okForCaseWorkerToCall: PropTypes.bool,
      howDidTheChildHearAboutUs: PropTypes.string,
      didYouDiscussRightsWithTheChild: PropTypes.bool,
      didTheChildFeelWeSolvedTheirProblem: PropTypes.bool,
      wouldTheChildRecommendUsToAFriend: PropTypes.bool,
    }),
  }),
});
