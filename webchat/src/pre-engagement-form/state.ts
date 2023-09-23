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

import type { PreEngagementFormDefinition } from '.';

export type PreEngagementFormState = {
  formDefinition?: PreEngagementFormDefinition;
  formState: {
    [key: string]: string;
  };
};

const initialState: PreEngagementFormState = {
  formState: {},
  formDefinition: undefined,
};

const RESET_FORM_STATE = 'RESET_FORM_STATE';
const SET_VALUE = 'SET_VALUE';
const SET_FORM_DEFINITION = 'SET_FORM_DEFINITION';

type SetValue = {
  type: typeof SET_VALUE;
  payload: {
    name: string;
    value: string;
  };
};

type ResetForm = {
  type: typeof RESET_FORM_STATE;
};

type SetFormDefinition = {
  type: typeof SET_FORM_DEFINITION;
  payload: PreEngagementFormDefinition;
};

type Action = SetValue | ResetForm | SetFormDefinition;

export const resetForm = (): ResetForm => ({
  type: RESET_FORM_STATE,
});

export const setValue = (name: string, value: string): SetValue => ({
  type: SET_VALUE,
  payload: {
    name,
    value,
  },
});

export const setFormDefinition = (formDefinition: PreEngagementFormDefinition): SetFormDefinition => ({
  type: SET_FORM_DEFINITION,
  payload: formDefinition,
});

export const preEngagementFormReducer = (state = initialState, action: Action) => {
  if (action.type === SET_VALUE) {
    return {
      ...state,
      formState: {
        ...state.formState,
        [action.payload.name]: action.payload.value,
      },
    };
  }

  if (action.type === RESET_FORM_STATE) {
    return {
      ...state,
      formState: initialState.formState,
    };
  }

  if (action.type === SET_FORM_DEFINITION) {
    return {
      ...state,
      formDefinition: action.payload,
    };
  }

  return state;
};
