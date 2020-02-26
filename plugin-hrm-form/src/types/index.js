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
