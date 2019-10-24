const ACTION_DISMISS_BAR = 'DISMISS_BAR';
const HANDLE_CHANGE = 'HANDLE_CHANGE';

const initialState = {
  isOpen: true,
  form: {
    jrandomname: 'add here',
    anothername: 'another name'
  }
};

export class Actions {
  static dismissBar = () => ({ type: ACTION_DISMISS_BAR });
  static handleChange = (e) => ({type: HANDLE_CHANGE, name: e.target.name, value: e.target.value});
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_DISMISS_BAR: {
      return {
        ...state,
        isOpen: false,
      };
    }

    case HANDLE_CHANGE: {
      return {
        ...state,
        form: {
          ...state.form,
          [action.name]: action.value
        }
      }
    }

    default:
      return state;
  }
}
