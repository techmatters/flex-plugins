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
 * The app's Redux store. Its state and logic live in each feature's slice (session, workspace,
 * draft, draftsList); components read it with useAppSelector and change it by dispatching their
 * feature's actions. What talks to the server is passed in as services, so tests can use the
 * real API in process.
 */
import {
  addListener,
  combineSlices,
  configureStore,
  createListenerMiddleware,
  ThunkAction,
  UnknownAction,
} from '@reduxjs/toolkit';
import type { TypedStartListening } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { DefinitionFiles, HelplineSummary } from '@tech-matters/form-builder-shared';
import { DraftClient, httpDraftClient } from '../drafts/draftClient';
import { draftReducer, startDraftAutosave } from '../drafts/draftSlice';
import { draftsListReducer } from '../drafts/draftsListSlice';
import { workspaceReducer } from '../workspace/workspaceSlice';
import { sessionReducer } from './sessionSlice';
import { fetchDefinitionFiles, fetchHelplines } from './api';

export type Services = {
  draftClient: DraftClient;
  fetchHelplines: () => Promise<HelplineSummary[]>;
  fetchDefinitionFiles: (code: string, version: string) => Promise<DefinitionFiles>;
  // How long after the last edit the draft is saved
  saveDelayMs: number;
  // Saves run one after another (flushDraft)
  saveQueue: { current: Promise<void> };
};

// Each editor's slice (its working copy and selections) is added by the editor's own module, with
// rootReducer.inject: declare it in LazyLoadedSlices (e.g. categories/categoriesSlice.ts)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LazyLoadedSlices {}

export const rootReducer = combineSlices({
  session: sessionReducer,
  draftsList: draftsListReducer,
  workspace: workspaceReducer,
  draft: draftReducer,
}).withLazyLoadedSlices<LazyLoadedSlices>();

export type RootState = ReturnType<typeof rootReducer>;

export const createAppStore = (services: Partial<Omit<Services, 'saveQueue'>> = {}) => {
  const extra: Services = {
    draftClient: httpDraftClient,
    fetchHelplines,
    fetchDefinitionFiles,
    saveDelayMs: 800,
    ...services,
    saveQueue: { current: Promise.resolve() },
  };
  const listener = createListenerMiddleware({ extra });
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra },
        // Definition files are big plain JSON: checking them on every action slows editing down
        immutableCheck: false,
        serializableCheck: false,
      }).prepend(listener.middleware),
  });
  startDraftAutosave(listener.startListening as AppListenerStartListening);
  return store;
};

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, Services, UnknownAction>;
export type AppListenerStartListening = TypedStartListening<RootState, AppDispatch, Services>;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export { addListener };
