import { omit } from 'lodash';

import * as t from './types';
import {
  INITIALIZE_CONTACT_STATE,
  RECREATE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  GeneralActionType,
  ContactFormDefinition,
} from '../types';
import { createStateItem } from '../../components/common/forms/formGenerators';
import { createFormDefinition as createContactlessTaskTabDefinition } from '../../components/tabbedForms/ContactlessTaskTabDefinition';
import callTypes, { CallTypes } from '../DomainConstants';

export type TaskEntry = {
  callType: CallTypes | '';
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  contactlessTask: { [key: string]: string | boolean };
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

type ContactsState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

// eslint-disable-next-line import/no-unused-modules
export const createNewTaskEntry = (definitions: ContactFormDefinition) => (recreated: boolean): TaskEntry => {
  const initialChildInformation = definitions.ChildInformationTab.reduce(createStateItem, {});
  const initialCallerInformation = definitions.CallerInformationTab.reduce(createStateItem, {});
  const initialCaseInformation = definitions.CaseInformationTab.reduce(createStateItem, {});

  const categoriesMeta = {
    gridView: false,
    expanded: Object.keys(definitions.IssueCategorizationTab).reduce(
      (acc, category) => ({ ...acc, [category]: false }),
      {},
    ),
  };

  const metadata = {
    startMillis: recreated ? null : new Date().getTime(),
    endMillis: null,
    tab: 1,
    recreated,
    categories: categoriesMeta,
  };

  const initialContactlessTaskTabDefinition = createContactlessTaskTabDefinition([]);
  const contactlessTask = initialContactlessTaskTabDefinition.reduce(createStateItem, {});

  return {
    callType: '',
    childInformation: initialChildInformation,
    callerInformation: initialCallerInformation,
    caseInformation: initialCaseInformation,
    contactlessTask,
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
          [action.taskId]: createNewTaskEntry(action.definitions)(false),
        },
      };
    case RECREATE_CONTACT_STATE:
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createNewTaskEntry(action.definitions)(true),
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
    case t.PREPOPULATE_FORM_CHILD: {
      const currentTask = state.tasks[action.taskId];
      const { firstName, gender, age, language } = action;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...currentTask,
            callType: callTypes.child,
            childInformation: {
              ...currentTask.childInformation,
              firstName,
              gender,
              age,
              language,
            },
          },
        },
      };
    }
    case t.PREPOPULATE_FORM_CALLER: {
      const currentTask = state.tasks[action.taskId];
      const { firstName, gender, age, language } = action;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...currentTask,
            callType: callTypes.caller,
            callerInformation: {
              ...currentTask.callerInformation,
              firstName,
              gender,
              age,
              language,
            },
          },
        },
      };
    }
    case t.RESTORE_ENTIRE_FORM: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: action.form,
        },
      };
    }
    default:
      return state;
  }
}
