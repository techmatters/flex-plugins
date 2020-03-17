import { saveToHrm } from '../components/HrmFormController';
import { createBlankForm, recreateBlankForm } from './ContactFormStateFactory';
import {
  HANDLE_BLUR,
  HANDLE_CHANGE,
  HANDLE_FOCUS,
  INITIALIZE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  SAVE_END_MILLIS,
  SAVE_CONTACT_STATE,
  HANDLE_SELECT_SEARCH_RESULT,
} from './ActionTypes';
import { countSelectedCategories } from './ValidationRules';
import { copySearchResultIntoTask } from './SearchContact';

const initialState = {
  tasks: {},
};

export class Actions {
  static handleChange = (taskId, parents, name, value) => ({ type: HANDLE_CHANGE, name, taskId, value, parents });

  /*
   * There has to be a better way to do this rather than a one-off, but MUI does not make it easy
   * static handleCallTypeButtonClick = (taskId, value, e) => ({type: HANDLE_CALLTYPE_BUTTON_CLICK, taskId: taskId, value: value});
   */
  static handleCallTypeButtonClick = (taskId, value, e) => ({
    type: HANDLE_CHANGE,
    name: 'callType',
    taskId,
    value,
    parents: [],
  });

  static initializeContactState = taskId => ({ type: INITIALIZE_CONTACT_STATE, taskId });

  // I'm really not sure if this should live here, but it seems like we need to come through the store
  static saveContactState = (task, abortFunction, hrmBaseUrl, workerSid, helpline) => ({
    type: SAVE_CONTACT_STATE,
    task,
    abortFunction,
    hrmBaseUrl,
    workerSid,
    helpline,
  });

  static removeContactState = taskId => ({ type: REMOVE_CONTACT_STATE, taskId });

  // records the end time (in milliseconds)
  static saveEndMillis = taskId => ({ type: SAVE_END_MILLIS, taskId });
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

    case HANDLE_FOCUS: {
      let currentForm;
      if (state.tasks[action.taskId]) {
        currentForm = state.tasks[action.taskId];
      } else {
        // currentForm = taskInitialStateFactory();
        currentForm = recreateBlankForm();
        console.log(`Had to recreate state for taskId ${action.taskId}`);
      }
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

      /*
       * let updatedContactForm = state.tasks[action.taskId];
       * updatedContactForm = {
       *   ...updatedContactForm,
       *   [action.name]: action.value
       * };
       * we could probably replace the below if/else by having the first argument to editNestedField be
       *  state.tasks[action.taskId] || taskInitialStateFactory()
       * but I want to be more explicit and log it.  Redux gets purged if there's a refresh and that's messy
       */
      let currentForm;
      if (state.tasks[action.taskId]) {
        currentForm = state.tasks[action.taskId];
      } else {
        // currentForm = taskInitialStateFactory();
        currentForm = recreateBlankForm();
        console.log(`Had to recreate state for taskId ${action.taskId}`);
      }
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

    case SAVE_CONTACT_STATE: {
      // TODO(nick): Make this a Promise instead?
      saveToHrm(
        action.task,
        state.tasks[action.task.taskSid],
        action.abortFunction,
        action.hrmBaseUrl,
        action.workerSid,
        action.helpline,
      );
      return state;
    }

    case REMOVE_CONTACT_STATE: {
      console.log(`!!!!!!!!!DELETING ENTRY FOR ${action.taskId}`);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: undefined,
        },
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

    default:
      return state;
  }
}
