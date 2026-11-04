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
 * The app's Redux store. Its state and logic live in each feature's slice (app, session,
 * workspace, draft, draftsList); components read it with useAppSelector and change it by dispatching their
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
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { BranchChoice, DefinitionFiles, HelplineSummary, PostFlowChoices } from '@tech-matters/form-builder-shared';
import type { Person } from '@tech-matters/form-builder-shared/flows/model';
import { DraftClient, httpDraftClient } from '../drafts/draftClient';
import { draftReducer, startDraftAutosave } from '../drafts/draftSlice';
import { draftsListReducer } from '../drafts/draftsListSlice';
import { workspaceReducer } from '../workspace/workspaceSlice';
import { httpBoardClient } from '../flows/boardClient';
import { sessionReducer } from './sessionSlice';
import { appReducer } from './appSlice';
import { fetchBranches, fetchDefinitionFiles, fetchHelplines, fetchPostFlowChoices } from './api';

export type Services = {
  draftClient: DraftClient;
  // branch: read from that flex-plugins branch instead of the default (Aselo staff)
  fetchHelplines: (branch?: string) => Promise<HelplineSummary[]>;
  fetchDefinitionFiles: (code: string, version: string, branch?: string) => Promise<DefinitionFiles>;
  fetchBranches: () => Promise<BranchChoice[]>;
  // The queues and post-call survey flows a helpline's postStudioFlows can point at
  fetchPostFlowChoices: (code: string) => Promise<PostFlowChoices>;
  // A people list (a helpline's, or the Aselo team's: the flow designer's), to say who a form
  // comment is for; none, no one to choose from
  loadPeople?: (code: string) => Promise<Person[]>;
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
  app: appReducer,
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
    fetchBranches,
    fetchPostFlowChoices,
    loadPeople: (code) => httpBoardClient.people(code),
    saveDelayMs: 800,
    ...services,
    saveQueue: { current: Promise.resolve() },
  };
  const listener = createListenerMiddleware({ extra });
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
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

const getServices = (): AppThunk<Services> => (_dispatch, _getState, services) => services;

// The store's services, for components not on the store yet that take them as props (e.g. ImportForms)
export const useServices = () => {
  const dispatch = useAppDispatch();
  return useMemo(() => dispatch(getServices()), [dispatch]);
};
