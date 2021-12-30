import * as t from './types';

export const setCustomGoodbyeMessage = (taskId: string, message: string): t.DualWriteActionType => ({
  type: t.SET_CUSTOM_GOODBYE_MESSAGE,
  taskId,
  message,
});

export const clearCustomGoodbyeMessage = (taskId: string): t.DualWriteActionType => ({
  type: t.CLEAR_CUSTOM_GOODBYE_MESSAGE,
  taskId,
});
