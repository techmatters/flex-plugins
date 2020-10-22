import { omit } from 'lodash';

import * as t from './types';
import ChildFormDefinition from '../../formDefinitions/childForm.json';
import { INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE, GeneralActionType } from '../types';
import type { FormItemDefinition, FormDefinition } from '../../components/common/forms/types';

type TaskEntry = {
  childForm: { [key: string]: string | boolean };
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

export const initialChildForm = (ChildFormDefinition as FormDefinition).reduce(createFormItem, {});

const newTaskEntry: TaskEntry = { childForm: initialChildForm };

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
