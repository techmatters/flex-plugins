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

import { QueuesStatusActionType, QueuesStatus, QUEUES_STATUS_UPDATE, QUEUES_STATUS_FAILURE } from './types';

type QueuesStatusState = {
  queuesStatus: QueuesStatus;
  error?: string;
  loading: boolean;
};

const initialState: QueuesStatusState = {
  queuesStatus: null,
  error: 'Not initialized',
  loading: true,
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: QueuesStatusActionType): QueuesStatusState {
  switch (action.type) {
    case QUEUES_STATUS_UPDATE:
      return {
        ...state,
        error: null,
        loading: false,
        queuesStatus: action.queuesStatus,
      };
    case QUEUES_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}
