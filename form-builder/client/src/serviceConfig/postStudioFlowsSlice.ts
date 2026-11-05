/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * The post-call surveys editor (PostStudioFlowsEditor.tsx): the queues and survey flows to choose
 * from (loaded for the open helpline), and the survey being added. Changes are written to the
 * draft's service-configuration files (editServiceConfig).
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { PostFlowChoices, ServiceConfigFileName } from '@tech-matters/form-builder-shared';

import { AppThunk, rootReducer } from '../app/store';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions } from '../workspace/workspaceSlice';
import { editServiceConfig } from './serviceConfigSlice';
import { setServiceConfigValue } from './serviceConfig';
import { FILE_OF, flowRef, POST_STUDIO_FLOWS_KEYS, postStudioFlowEntries, queueLabel, Where } from './postStudioFlows';

type PostStudioFlowsState = {
  // The helpline the choices are for
  code?: string;
  choices?: PostFlowChoices;
  loadError?: string;
  // The survey being added
  queue: string;
  flowTrigger: string;
  flow: string;
  where: Where;
  error?: string;
};

const initialState: PostStudioFlowsState = {
  queue: '',
  flowTrigger: 'rest',
  flow: '',
  where: 'both',
};

const postStudioFlowsSlice = createSlice({
  name: 'postStudioFlows',
  initialState,
  reducers: {
    // Shown for a helpline: its choices are loaded again, and nothing is being added
    postStudioFlowsOpened: (_state, action: PayloadAction<string>) => ({
      ...initialState,
      code: action.payload,
    }),
    choicesLoaded: (state, action: PayloadAction<{ code: string; choices: PostFlowChoices }>) => {
      if (state.code === action.payload.code) state.choices = action.payload.choices;
    },
    choicesFailed: (state, action: PayloadAction<{ code: string; message: string }>) => {
      if (state.code === action.payload.code) state.loadError = action.payload.message;
    },
    newSurveyChanged: (
      state,
      action: PayloadAction<Partial<Pick<PostStudioFlowsState, 'queue' | 'flowTrigger' | 'flow' | 'where'>>>,
    ) => {
      Object.assign(state, action.payload);
    },
    surveyAdded: state => {
      state.queue = '';
      state.error = undefined;
    },
    addFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  selectors: {
    selectPostStudioFlows: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof postStudioFlowsSlice> {}
}
const injected = postStudioFlowsSlice.injectInto(rootReducer);
export const { selectPostStudioFlows } = injected.selectors;
const { postStudioFlowsOpened, choicesLoaded, choicesFailed, surveyAdded, addFailed } = postStudioFlowsSlice.actions;
export const { newSurveyChanged } = postStudioFlowsSlice.actions;

// Starts the editor for the open helpline, and loads the queues and flows it can choose from
export const openPostStudioFlows = (): AppThunk<Promise<void>> => async (dispatch, getState, services) => {
  const code = selectDefinitions(getState())?.code ?? '';
  dispatch(postStudioFlowsOpened(code));
  try {
    dispatch(choicesLoaded({ code, choices: await services.fetchPostFlowChoices(code) }));
  } catch (err) {
    dispatch(choicesFailed({ code, message: (err as Error).message }));
  }
};

// Sets (or, with undefined, removes) one queue's survey in one file
export const setPostStudioFlow =
  (file: ServiceConfigFileName, queueKey: string, value: unknown): AppThunk =>
  dispatch =>
    dispatch(
      editServiceConfig(files => setServiceConfigValue(files, file, [...POST_STUDIO_FLOWS_KEYS, queueKey], value)),
    );

// Adds the survey chosen, unless its file already has one for that queue
export const addPostStudioFlow = (): AppThunk => (dispatch, getState) => {
  const { queue, flow, flowTrigger, where, choices } = selectPostStudioFlows(getState());
  if (!queue || !flow) {
    dispatch(addFailed('Choose a queue and a survey flow.'));
    return;
  }
  const file = FILE_OF[where];
  if (postStudioFlowEntries(selectDraftFiles(getState())).some(entry => entry.file === file && entry.queue === queue)) {
    dispatch(addFailed(`${file}.json already has a survey for ${queueLabel(queue, choices)}: change it in the list.`));
    return;
  }
  dispatch(setPostStudioFlow(file, queue, { flowTrigger, studioFlowSid: flowRef(flow) }));
  dispatch(surveyAdded());
};
