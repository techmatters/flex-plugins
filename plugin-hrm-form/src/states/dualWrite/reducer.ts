/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { omit } from 'lodash';

import * as t from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';

type DualWriteState = {
  tasks: {
    [taskId: string]: {
      customGoodbyeMessage?: string;
    };
  };
};

const initialState: DualWriteState = { tasks: {} };

export function reduce(state = initialState, action: t.DualWriteActionType | RemoveContactStateAction): DualWriteState {
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
