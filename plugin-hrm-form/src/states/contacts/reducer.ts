import { omit } from 'lodash';

import * as t from './types';
import ChildFormDefinition from '../../formDefinitions/childForm.json';
import CallerFormDefinition from '../../formDefinitions/callerForm.json';
import CaseInfoFormDefinition from '../../formDefinitions/caseInfoForm.json';
import CategoriesFormDefinition from '../../formDefinitions/categories.json';
import { INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE, GeneralActionType } from '../types';
import type { FormItemDefinition, FormDefinition } from '../../components/common/forms/types';
import { CallTypes } from '../DomainConstants';

export type TaskEntry = {
  callType: CallTypes | '';
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  categories: string[];
  metadata: {
    startMillis: number;
    endMillis: number;
    recreated: boolean;
    categories: {
      gridView: boolean;
      expanded: { [key: string]: boolean };
    };
  };
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
    case 'dependent-select':
      return def.defaultOption.value;
    case 'checkbox':
      return '';
    default:
      return null;
  }
};

const createFormItem = <T extends {}>(obj: T, def: FormItemDefinition) => ({
  ...obj,
  [def.name]: getInitialValue(def),
});

// eslint-disable-next-line import/no-unused-modules
export const createNewTaskEntry = (recreated: boolean): TaskEntry => {
  const initialChildInformation = (ChildFormDefinition as FormDefinition).reduce(createFormItem, {});
  const initialCallerInformation = (CallerFormDefinition as FormDefinition).reduce(createFormItem, {});
  const initialCaseInformation = (CaseInfoFormDefinition as FormDefinition).reduce(createFormItem, {});

  const categoriesMeta = {
    gridView: false,
    expanded: Object.keys(CategoriesFormDefinition).reduce((acc, category) => ({ ...acc, [category]: false }), {}),
  };
  const metadata = {
    startMillis: recreated ? null : new Date().getTime(),
    endMillis: null,
    tab: 1,
    recreated,
    categories: categoriesMeta,
  };

  return {
    callType: '',
    childInformation: initialChildInformation,
    callerInformation: initialCallerInformation,
    caseInformation: initialCaseInformation,
    categories: [],
    metadata,
  };
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
          [action.taskId]: createNewTaskEntry(false),
        },
      };
    case RECREATE_CONTACT_STATE:
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createNewTaskEntry(true),
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
    case t.SAVE_END_MILLIS: {
      const taskToEnd = state.tasks[action.taskId];

      const { metadata } = taskToEnd;
      const endedTask = { ...taskToEnd, metadata: { ...metadata, endMillis: new Date().getTime() } };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: endedTask,
        },
      };
    }
    case t.SET_CATEGORIES_GRID_VIEW: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const { categories } = metadata;
      const taskWithCategoriesViewToggled = {
        ...currentTask,
        metadata: {
          ...metadata,
          categories: {
            ...categories,
            gridView: action.gridView,
          },
        },
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithCategoriesViewToggled,
        },
      };
    }
    case t.HANDLE_EXPAND_CATEGORY: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const { categories } = metadata;
      const taskWithCategoriesExpanded = {
        ...currentTask,
        metadata: {
          ...metadata,
          categories: {
            ...categories,
            expanded: {
              ...categories.expanded,
              [action.category]: !categories.expanded[action.category],
            },
          },
        },
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithCategoriesExpanded,
        },
      };
    }
    default:
      return state;
  }
}
