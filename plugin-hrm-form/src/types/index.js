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

import PropTypes from 'prop-types';

export const taskType = PropTypes.shape({
  taskSid: PropTypes.string,
  number: PropTypes.string,
});

export const counselorType = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.string,
});

export const fieldType = PropTypes.shape({
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, counselorType]),
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
  validation: PropTypes.arrayOf(PropTypes.string),
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

const formType = PropTypes.shape({
  callType: callTypeType,
  callerInformation: callerInformationType,
  childInformation: childInformationType,
  caseInformation: caseInformationType,
});

const localizationType = PropTypes.shape({
  // eslint-disable-next-line react/forbid-prop-types
  manager: PropTypes.object.isRequired,
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

export const searchFormType = PropTypes.shape({
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  counselor: counselorType,
  phoneNumber: PropTypes.string,
  dateFrom: PropTypes.string,
  dateTo: PropTypes.string,
  contactNumber: PropTypes.string,
});
