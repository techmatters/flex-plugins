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

import { FormInputType, FormItemDefinition } from '@tech-matters/hrm-form-definitions';
import { FormDefinitionSet } from './testHrmTypes';

const BASE_PERSON_FORM_DEFINITION: FormItemDefinition[] = [
  {
    label: '',
    name: 'firstName',
    type: FormInputType.Input,
  },
  {
    label: '',
    name: 'age',
    type: FormInputType.Select,
    options: [
      {
        value: '',
        label: '',
      },
      {
        value: '11',
        label: '',
      },
      {
        value: '>12',
        label: '',
      },
      {
        value: 'Unknown',
        label: '',
      },
    ],
  },
  {
    label: '',
    name: 'gender',
    defaultOption: {
      label: '',
      value: 'Unknown',
    },
    type: FormInputType.Select,
    options: [
      {
        label: '',
        value: 'Agender',
      },
      {
        label: '',
        value: 'Non-Binary/Genderqueer/Gender fluid',
      },
      {
        label: '',
        value: 'Unknown',
      },
    ],
  },
  {
    label: '',
    name: 'otherGender',
    type: FormInputType.Input,
  },
];
export const BASE_FORM_DEFINITION: FormDefinitionSet = {
  childInformation: BASE_PERSON_FORM_DEFINITION,
  callerInformation: BASE_PERSON_FORM_DEFINITION,
  caseInformation: [{
    label: '',
    name: 'age',
    type: FormInputType.Input, }],
  prepopulateKeys: {
    preEngagement: {
      ChildInformationTab: [],
      CallerInformationTab: [],
      CaseInformationTab: [],
    },
    survey: {
      ChildInformationTab: [],
      CallerInformationTab: [],
    },
  },
  prepopulateMappings: {
    preEngagement: {},
    survey: {},
  },
  helplineInformation: {
    label: '',
    helplines: [{ label: '', value: '' }],
  },
};
export const MOCK_FORM_DEFINITION_URL = new URL(
  'http://mock-assets-bucket/form-definitions',
);
