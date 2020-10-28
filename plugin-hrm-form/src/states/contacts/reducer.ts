import { omit } from 'lodash';

import * as t from './types';
import ChildFormDefinition from '../../formDefinitions/childForm.json';
import CallerFormDefinition from '../../formDefinitions/callerForm.json';
import CategoriesFormDefinition from '../../formDefinitions/categories.json';
import { INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE, GeneralActionType } from '../types';
import type { FormItemDefinition, FormDefinition, CategoryEntry } from '../../components/common/forms/types';

export type TaskEntry = {
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  categories: string[];
  // categories: { [category: string]: { [subcategory: string]: boolean } };
  /*
   * caseInformation: { [key: string]: string | boolean };
   * metadata: {
   *   startMillis: Date;
   *   endMillis: Date;
   *   recreated: boolean;
   * };
   */
};

export type ContactsState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

const getInitialValue = (def: FormItemDefinition) => {
  switch (def.type) {
    case 'input':
      return '';
    case 'numeric input':
      return '';
    case 'select':
      return def.options[0].value;
    default:
      return null;
  }
};

const createFormItem = <T extends {}>(obj: T, def: FormItemDefinition) => ({
  ...obj,
  [def.name]: getInitialValue(def),
});

const createCategory = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory]: false }), {}),
});

const initialChildInformation = (ChildFormDefinition as FormDefinition).reduce(createFormItem, {});
const initialCallerInformation = (CallerFormDefinition as FormDefinition).reduce(createFormItem, {});
const initialCategories = Object.entries(CategoriesFormDefinition).reduce(createCategory, {});

const newTaskEntry: TaskEntry = {
  childInformation: initialChildInformation,
  callerInformation: initialCallerInformation,
  categories: [],
  // categories: initialCategories,
};

const initialState: ContactsState = { tasks: {} };

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: t.ContactsActionType | GeneralActionType): ContactsState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    case RECREATE_CONTACT_STATE:
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.UPDATE_FORM:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            [action.parent]: action.payload,
          },
        },
      };
    default:
      return state;
  }
}
