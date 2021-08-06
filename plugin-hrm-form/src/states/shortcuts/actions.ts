import * as t from './types';

export const updatePressedKeys = (pressedKeys: t.PressedKeys): t.ShortcutActionType => ({
  type: t.UPDATE_KEYS_PRESSED,
  pressedKeys,
});

export const openGuideModal = (): t.ShortcutActionType => ({ type: t.OPEN_GUIDE_MODAL });

export const closeGuideModal = (): t.ShortcutActionType => ({ type: t.CLOSE_GUIDE_MODAL });
