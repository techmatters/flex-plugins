import { omit } from 'lodash';

import * as t from './types';
import { GeneralActionType, REMOVE_CONTACT_STATE } from '../types';

type DualWriteState = {
  tasks: {
    [taskId: string]: {
      customGoodbyeMessage?: string;
    };
  };
};

const initialState: DualWriteState = { tasks: {} };

export function reduce(state = initialState, action: t.DualWriteActionType | GeneralActionType): DualWriteState {
  switch (action.type) {
    case t.SET_CUSTOM_GOODBYE_MESSAGE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...[action.taskId],
            customGoodbyeMessage: action.message,
          },
        },
      };

    case t.CLEAR_CUSTOM_GOODBYE_MESSAGE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...[action.taskId],
            customGoodbyeMessage: null,
          },
        },
      };

    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };

    default:
      return state;
  }
}
