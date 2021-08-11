export const UPDATE_KEYS_PRESSED = 'UPDATE_KEYS_PRESSED';
export const OPEN_GUIDE_MODAL = 'OPEN_GUIDE_MODAL';
export const CLOSE_GUIDE_MODAL = 'CLOSE_GUIDE_MODAL';

export type PressedKeys = {
  [key: string]: boolean;
};

type UpdatePressedKeysAction = { type: typeof UPDATE_KEYS_PRESSED; pressedKeys: PressedKeys };
type OpenGuideModalAction = { type: typeof OPEN_GUIDE_MODAL };
type CloseGuideModalAction = { type: typeof CLOSE_GUIDE_MODAL };

export type ShortcutActionType = UpdatePressedKeysAction | OpenGuideModalAction | CloseGuideModalAction;
