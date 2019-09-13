const ACTION_DISMISS_BAR = 'DISMISS_BAR';

const initialState = {
  subcategory: 'my category',
};

export class Actions {
  static dismissBar = (e) => ({ type: ACTION_DISMISS_BAR, text: e.target.value });
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_DISMISS_BAR: {
      return {
        ...state,
        subcategory: action.text,
      };
    }

    default:
      return state;
  }
}
