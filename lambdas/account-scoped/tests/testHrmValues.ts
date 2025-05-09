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

import {
  FormInputType,
  FormItemDefinition,
} from '@tech-matters/hrm-form-definitions';
import { FormDefinitionSet } from './testHrmTypes';

const BASE_PERSON_FORM_DEFINITION: FormItemDefinition[] = [
  {
    name: 'firstName',
    type: FormInputType.Input,
  },
  {
    name: 'age',
    type: FormInputType.Select,
    options: [
      {
        value: '',
      },
      {
        value: '11',
      },
      {
        value: '>12',
      },
      {
        value: 'Unknown',
      },
    ],
  },
  {
    name: 'gender',
    defaultOption: {
      value: 'Unknown',
    },
    type: FormInputType.Select,
    options: [
      {
        value: 'Agender',
      },
      {
        value: 'Non-Binary/Genderqueer/Gender fluid',
      },
      {
        value: 'Unknown',
      },
    ],
  },
  {
    name: 'otherGender',
    type: FormInputType.Input,
  },
] as FormItemDefinition[];
export const BASE_FORM_DEFINITION: FormDefinitionSet = {
  childInformation: BASE_PERSON_FORM_DEFINITION,
  callerInformation: BASE_PERSON_FORM_DEFINITION,
  caseInformation: [],
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
  helplineInformation: {
    label: '',
    helplines: [{ label: '', value: '' }],
  },
};
export const MOCK_FORM_DEFINITION_URL = new URL(
  'http://mock-assets-bucket/form-definitions',
);
