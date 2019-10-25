const HANDLE_CHANGE = 'HANDLE_CHANGE';

const initialState = {
  tasks: { }
};

export class Actions {
  static handleChange = (taskId, e) => ({type: HANDLE_CHANGE, name: e.target.name, value: e.target.value, taskId: taskId });
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

    default:
      return state;
  }
}
