import PropTypes from 'prop-types';

export const taskType = PropTypes.shape({
  taskSid: PropTypes.string,
});

export const counselorType = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.string,
});

export const fieldType = PropTypes.shape({
  value: PropTypes.oneOfType([PropTypes.string, counselorType]),
  error: PropTypes.string,
  validation: PropTypes.arrayOf(PropTypes.string),
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

export const childInformationType = PropTypes.shape({
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

/*
 * Currently unused. Should we remove this or keep it for some time?
 * export const callerInformationType = PropTypes.shape({
 *   name: nameType,
 *   relationshipToChild: fieldType,
 *   gender: fieldType,
 *   age: fieldType,
 *   language: fieldType,
 *   nationality: fieldType,
 *   ethnicity: fieldType,
 *   location: locationType,
 * });
 */

export const caseInformationType = PropTypes.shape({
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

export const localizationType = PropTypes.shape({
  strings: PropTypes.object.isRequired,
  isCallTask: PropTypes.func.isRequired,
});

export const contactType = PropTypes.shape({
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
    disabledOrSpecialNeeds: PropTypes.bool,
    hiv: PropTypes.bool,
    school: PropTypes.shape({
      name: PropTypes.string,
      gradeLevel: PropTypes.string,
    }),
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
  callerInformation: PropTypes.shape({
    name: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    relationshipToChild: PropTypes.string,
    gender: PropTypes.string,
    age: PropTypes.string,
    language: PropTypes.string,
    nationality: PropTypes.string,
    ethnicity: PropTypes.string,
    location: PropTypes.shape({
      city: PropTypes.string,
      phone1: PropTypes.string,
      phone2: PropTypes.string,
      postalCode: PropTypes.string,
      stateOrCounty: PropTypes.string,
      streetAddress: PropTypes.string,
    }),
  }),
});

export const searchResultType = PropTypes.shape({
  contactId: PropTypes.string.isRequired,
  overview: PropTypes.shape({
    dateTime: PropTypes.string,
    name: PropTypes.string,
    customerNumber: PropTypes.string,
    callType: PropTypes.string,
    categories: PropTypes.shape({}),
    counselor: PropTypes.string,
    notes: PropTypes.string,
    channel: PropTypes.string,
    conversationDuration: PropTypes.number,
  }).isRequired,
  details: contactType.isRequired,
  counselor: PropTypes.string,
});

export const searchFormType = PropTypes.shape({
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  counselor: counselorType,
  phoneNumber: PropTypes.string,
  dateFrom: PropTypes.string,
  dateTo: PropTypes.string,
});
