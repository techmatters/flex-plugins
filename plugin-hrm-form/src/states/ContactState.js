import { omit } from 'lodash';

import { createBlankForm, recreateBlankForm } from './ContactFormStateFactory';
import {
  HANDLE_BLUR,
  HANDLE_VALIDATE_FORM,
  HANDLE_CHANGE,
  HANDLE_FOCUS,
  INITIALIZE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  SAVE_END_MILLIS,
  HANDLE_SELECT_SEARCH_RESULT,
  CHANGE_TAB,
  CHANGE_ROUTE,
  SET_CONNECTED_CASE,
} from './ActionTypes';
import { countSelectedCategories } from './ValidationRules';
import { copySearchResultIntoTask } from './SearchContact';

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

  static initializeContactState = taskId => ({ type: INITIALIZE_CONTACT_STATE, taskId });

  static removeContactState = taskId => ({ type: REMOVE_CONTACT_STATE, taskId });

  // records the end time (in milliseconds)
  static saveEndMillis = taskId => ({ type: SAVE_END_MILLIS, taskId });

  static changeTab = (tab, taskId) => ({ type: CHANGE_TAB, tab, taskId });

  static changeRoute = (route, taskId) => ({ type: CHANGE_ROUTE, route, taskId });

  static setConnectedCase = (connectedCase, taskId) => ({ type: SET_CONNECTED_CASE, connectedCase, taskId });
}

// Will replace the below when we move over to field objects
function editNestedField(original, parents, name, change) {
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
          newForm.caseInformation.categories.error = 'You must check at least one option';
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

    case CHANGE_ROUTE: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const taskWithUpdatedRoute = { ...currentTask, metadata: { ...metadata, route: action.route } };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithUpdatedRoute,
        },
      };
    }

    case SET_CONNECTED_CASE: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const taskWithConnectedCase = { ...currentTask, metadata: { ...metadata, connectedCase: action.connectedCase } };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithConnectedCase,
        },
      };
    }

    default:
      return state;
  }
}
