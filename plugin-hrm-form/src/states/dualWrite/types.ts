export const SET_CUSTOM_GOODBYE_MESSAGE = 'SET_CUSTOM_GOODBYE_MESSAGE';
export const CLEAR_CUSTOM_GOODBYE_MESSAGE = 'CLEAR_CUSTOM_GOODBYE_MESSAGE';

type SetCustomGoodbyeMessageAction = {
  type: typeof SET_CUSTOM_GOODBYE_MESSAGE;
  taskId: string;
  message: string;
};

type ClearCustomGoodbyeMessageAction = {
  type: typeof CLEAR_CUSTOM_GOODBYE_MESSAGE;
  taskId: string;
};

export type DualWriteActionType = SetCustomGoodbyeMessageAction | ClearCustomGoodbyeMessageAction;
