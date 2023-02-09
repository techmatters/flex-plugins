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
