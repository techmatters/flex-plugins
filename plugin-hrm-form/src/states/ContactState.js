const HANDLE_CHANGE = 'HANDLE_CHANGE';
const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

const initialState = {
  tasks: { }
};

const taskInitialState = {
    jrandomname: 'add here',
    anothername: 'another name'
};

export class Actions {
  static handleChange = (taskId, e) => ({type: HANDLE_CHANGE, name: e.target.name, value: e.target.value, taskId: taskId });
  static initializeContactState = (taskId, e) => ({type: INITIALIZE_CONTACT_STATE, taskId: taskId});
  static removeContactState = (taskId, e) => ({type: REMOVE_CONTACT_STATE, taskId: taskId});
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case HANDLE_CHANGE: {
      let newContactForm = {};
      newContactForm = {
        ...newContactForm,
        [action.name]: action.value
      };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newContactForm
        }
      };
    }

    case INITIALIZE_CONTACT_STATE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskInitialState
        }
      }
    }

    case REMOVE_CONTACT_STATE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: undefined
        }
      }
    }

    default:
      return state;
  }
}
