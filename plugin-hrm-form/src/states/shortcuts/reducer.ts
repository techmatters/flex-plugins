import * as t from './types';

type ShortcutState = {
  pressedKeys: t.PressedKeys;
  isGuideModalOpen: boolean;
};

const initialState: ShortcutState = {
  pressedKeys: {},
  isGuideModalOpen: false,
};

export function reduce(state = initialState, action: t.ShortcutActionType): ShortcutState {
  switch (action.type) {
    case t.UPDATE_KEYS_PRESSED:
      const updatedPressedKeys = {
        ...state.pressedKeys,
        ...action.pressedKeys,
      };
      return {
        ...state,
        pressedKeys: updatedPressedKeys,
      };
    case t.OPEN_GUIDE_MODAL:
      return {
        ...state,
        isGuideModalOpen: true,
      };
    case t.CLOSE_GUIDE_MODAL:
      return {
        ...state,
        isGuideModalOpen: false,
      };
    default:
      return state;
  }
}
