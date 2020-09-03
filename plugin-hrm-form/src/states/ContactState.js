import { omit } from 'lodash';

import { createBlankForm, recreateBlankForm } from './ContactFormStateFactory';
import {
  HANDLE_BLUR,
  HANDLE_VALIDATE_FORM,
  HANDLE_CHANGE,
  HANDLE_FOCUS,
  SAVE_END_MILLIS,
  HANDLE_SELECT_SEARCH_RESULT,
  CHANGE_TAB,
  RESTORE_ENTIRE_FORM,
  SET_CATEGORIES_GRID_VIEW,
  HANDLE_EXPAND_CATEGORY,
  PREPOPULATE_FORM_CHILD,
  PREPOPULATE_FORM_CALLER,
} from './ActionTypes';
import { INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from './types';
import { countSelectedCategories } from './ValidationRules';
import { copySearchResultIntoTask } from './contacts/helpers';
import { getConfig } from '../HrmFormPlugin';

/**
 * Looks for a particular task in the state object, and returns it if found.
 * Returns recreated form otherwise
 * @param {{ [x: string]: any; }} tasks the current tasks object (retrieved from state)
 * @param {string} taskId the task we are looking for
 * @returns if the task exists in state, returns its current form.
 *  Otherwise returns a recreated blank form
 */
const findOrRecreate = (tasks, taskId) => {
  const targetedTask = tasks[taskId];

  if (targetedTask === undefined) {
    const recreatedTask = recreateBlankForm();
    console.log(`Had to recreate state for taskId ${taskId}`);
    return recreatedTask;
  }

  return targetedTask;
};

const initialState = {
  tasks: {},
};

export class Actions {
  static handleChange = (taskId, parents, name, value) => ({ type: HANDLE_CHANGE, name, taskId, value, parents });

  /*
   * There has to be a better way to do this rather than a one-off, but MUI does not make it easy
   * static handleCallTypeButtonClick = (taskId, value, e) => ({type: HANDLE_CALLTYPE_BUTTON_CLICK, taskId: taskId, value: value});
   */
  static handleCallTypeButtonClick = (taskId, value) => ({
    type: HANDLE_CHANGE,
    name: 'callType',
    taskId,
    value,
    parents: [],
  });

  // records the end time (in milliseconds)
  static saveEndMillis = taskId => ({ type: SAVE_END_MILLIS, taskId });

  static changeTab = (tab, taskId) => ({ type: CHANGE_TAB, tab, taskId });

  static restoreEntireForm = (form, taskId) => ({
    type: RESTORE_ENTIRE_FORM,
    form,
    taskId,
  });

  static setCategoriesGridView = (gridView, taskId) => ({ type: SET_CATEGORIES_GRID_VIEW, gridView, taskId });

  static handleExpandCategory = (category, taskId) => ({ type: HANDLE_EXPAND_CATEGORY, category, taskId });

  static prepopulateFormChild = (gender, age, taskId) => ({ type: PREPOPULATE_FORM_CHILD, gender, age, taskId });

  static prepopulateFormCaller = (gender, age, taskId) => ({ type: PREPOPULATE_FORM_CALLER, gender, age, taskId });
}

export const handleSelectSearchResult = (searchResult, taskId) => ({
  type: t.HANDLE_SELECT_SEARCH_RESULT,
  searchResult,
  taskId,
});

// Will replace the below when we move over to field objects
export function editNestedField(original, parents, name, change) {
  if (parents.length === 0) {
    return {
      ...original,
      [name]: {
        ...original[name],
        ...change,
      },
    };
  }
  return {
    ...original,
    [parents[0]]: editNestedField(original[parents[0]], parents.slice(1), name, change),
  };
}

// eslint-disable-next-line complexity
export function reduce(state = initialState, action) {
  switch (action.type) {
    case HANDLE_BLUR: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: action.form,
        },
      };
    }

    case HANDLE_VALIDATE_FORM: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: action.form,
        },
      };
    }

    case HANDLE_FOCUS: {
      const currentForm = findOrRecreate(state.tasks, action.taskId);

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: editNestedField(currentForm, action.parents, action.name, { touched: true }),
        },
      };
    }

    case HANDLE_CHANGE: {
      console.log(
        `!!!!!!!!!!!HANDLE CHANGE: action.name = ${action.name}, action.value = ${action.value}, task = ${action.taskId}, parents: ${action.parents}`,
      );

      const { strings } = getConfig();

      const currentForm = findOrRecreate(state.tasks, action.taskId);

      const newForm = editNestedField(currentForm, action.parents, action.name, { value: action.value });

      /*
       * This is a very sad special case but it's the only case where we need to update
       * validation information on a change rather than on a blur.
       * Note that firefox and safari on Mac do not focus or blur checkboxes.
       * I'm sure there's a better way to do this.
       */
      if (action.parents.length >= 2 && action.parents[0] === 'caseInformation' && action.parents[1] === 'categories') {
        if (countSelectedCategories(newForm.caseInformation.categories) > 0) {
          newForm.caseInformation.categories.error = null;
        } else {
          newForm.caseInformation.categories.error = strings['Error-CategoryRequired'];
        }
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newForm,
        },
      };
    }

    case INITIALIZE_CONTACT_STATE: {
      console.log(`!!!!!!!!!CREATING NEW ENTRY FOR ${action.taskId}`);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createBlankForm(),
        },
      };
    }

    case RECREATE_CONTACT_STATE: {
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: recreateBlankForm(),
        },
      };
    }

    case SAVE_END_MILLIS: {
      const taskToEnd = findOrRecreate(state.tasks, action.taskId);

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

    case REMOVE_CONTACT_STATE: {
      console.log(`!!!!!!!!!DELETING ENTRY FOR ${action.taskId}`);
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    }

    case HANDLE_SELECT_SEARCH_RESULT: {
      const currentTask = state.tasks[action.taskId];
      const task = copySearchResultIntoTask(currentTask, action.searchResult);

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: task,
        },
      };
    }

    case CHANGE_TAB: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const taskWithUpdatedTab = { ...currentTask, metadata: { ...metadata, tab: action.tab } };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithUpdatedTab,
        },
      };
    }

    case PREPOPULATE_FORM_CHILD: {
      const currentTask = state.tasks[action.taskId];
      const { gender, age } = action;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...currentTask,
            callType: {
              ...currentTask.callType,
              value: 'Child calling about self',
            },
            childInformation: {
              ...currentTask.childInformation,
              gender: {
                ...currentTask.childInformation.gender,
                value: gender,
              },
              age: {
                ...currentTask.childInformation.age,
                value: age,
              },
            },
          },
        },
      };
    }

    case PREPOPULATE_FORM_CALLER: {
      const currentTask = state.tasks[action.taskId];
      const { gender, age } = action;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...currentTask,
            callType: {
              ...currentTask.callType,
              value: 'Someone calling about a child',
            },
            callerInformation: {
              ...currentTask.callerInformation,
              gender: {
                ...currentTask.callerInformation.gender,
                value: gender,
              },
              age: {
                ...currentTask.callerInformation.age,
                value: age,
              },
            },
          },
        },
      };
    }

    case SET_CATEGORIES_GRID_VIEW: {
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

    case HANDLE_EXPAND_CATEGORY: {
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

    case RESTORE_ENTIRE_FORM: {
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
