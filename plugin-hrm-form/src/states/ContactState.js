const HANDLE_CHANGE = 'HANDLE_CHANGE';
const HANDLE_CALLTYPE_BUTTON_CLICK = 'HANDLE_CALLTYPE_BUTTON_CLICK';
const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

const initialState = {
  tasks: { }
};

const taskInitialStateFactory = () => {
    return {
      jrandomname: 'add here',
      anothername: 'another name',
      callType: '',
      callerInformation: {

      },
      childInformation: {

      },
      caseInformation: {

      }
    };
};

export class Actions {
  static handleChange = (taskId, e) => ({type: HANDLE_CHANGE, name: e.target.name, value: e.target.value, taskId: taskId});
  // There has to be a better way to do this rather than a one-off, but MUI does not make it easy
  static handleCallTypeButtonClick = (taskId, value, e) => ({type: HANDLE_CALLTYPE_BUTTON_CLICK, taskId: taskId, value: value});
  static initializeContactState = (taskId, e) => ({type: INITIALIZE_CONTACT_STATE, taskId: taskId});
  static removeContactState = (taskId, e) => ({type: REMOVE_CONTACT_STATE, taskId: taskId});
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case HANDLE_CHANGE: {
      console.log("!!!!!!!!!!!HANDLE CHANGE: action.name = " + action.name + ", action.value = " + action.value + ", task = " + action.taskId);
      let updatedContactForm = state.tasks[action.taskId];
      updatedContactForm = {
        ...updatedContactForm,
        [action.name]: action.value
      };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: updatedContactForm
        }
      };
    }

    case HANDLE_CALLTYPE_BUTTON_CLICK: {
      console.log("!!!!!!!CALLTYPE BUTTON: " + action.value);
      let updatedContactForm = state.tasks[action.taskId];
      updatedContactForm = {
        ...updatedContactForm,
        callType: action.value
      };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: updatedContactForm
        }
      };
    }

    case INITIALIZE_CONTACT_STATE: {
      console.log("!!!!!!!!!CREATING NEW ENTRY FOR " + action.taskId);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskInitialStateFactory()
        }
      }
    }

    case REMOVE_CONTACT_STATE: {
      console.log("!!!!!!!!!DELETING ENTRY FOR " + action.taskId);
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
