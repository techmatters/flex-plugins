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

import { combineReducers } from 'redux';
import { AppState, WebchatReducer } from '@twilio/flex-webchat-ui';

import { taskReducer, TaskState } from './task';
import { emojiReducer, EmojiState } from './emoji-picker/emoji-state';
import { preEngagementFormReducer, PreEngagementFormState } from './pre-engagement-form/state';

export type AseloWebchatState = {
  flex: AppState;
  task: TaskState;
  emoji: EmojiState;
  preEngagementForm: PreEngagementFormState;
};

const reducers = {
  flex: (state: AppState | undefined, action: any) => WebchatReducer(state as AppState, action),
  task: taskReducer,
  emoji: emojiReducer,
  preEngagementForm: preEngagementFormReducer,
} as const;

const combinedReducer = combineReducers<AseloWebchatState>(reducers);

export const aseloReducer = (state: AseloWebchatState | undefined, action: any) => {
  return combinedReducer(state, action);
};
