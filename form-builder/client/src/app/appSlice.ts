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
 * The app's shell: which area is showing (Forms, Contact flows, Routing, Chatbots, kept in the URL
 * as ?area=), which areas have been opened, the help panel beside them, and a guide's tour.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk, RootState } from './store';
import type { HelpArticle } from '../help/articles';

export type Area = 'forms' | 'flows' | 'routing' | 'chatbots';

export const AREAS: Area[] = ['forms', 'flows', 'routing', 'chatbots'];

export const AREA_LABELS: Record<Area, string> = {
  forms: 'Forms',
  flows: 'Contact flows',
  routing: 'Routing',
  chatbots: 'Chatbots',
};

const areaFromUrl = (): Area => {
  const area = new URLSearchParams(window.location.search).get('area');
  return area === 'flows' || area === 'routing' || area === 'chatbots' ? area : 'forms';
};

export type AppState = {
  area: Area;
  // Areas opened stay as they were left (hidden, not closed): e.g. add a skill in Routing and go
  // back to the board being worked on. Each has its own way back to its start page.
  opened: Area[];
  // The help panel, beside whatever area is open
  helpOpen: boolean;
  // An article asked for from the page (a section's "Need help?"), a new one each time
  helpRequest?: { slug: string; at: number };
  // A guide's "Show me" tour, while it runs, and the step it's on
  tour?: HelpArticle;
  tourStep: number;
};

const appSlice = createSlice({
  name: 'app',
  // Read when the store is made: the area in the link
  initialState: (): AppState => {
    const area = areaFromUrl();
    return { area, opened: [area], helpOpen: false, tourStep: 0 };
  },
  reducers: {
    areaShown: (state, action: PayloadAction<Area>) => {
      state.area = action.payload;
      if (!state.opened.includes(action.payload)) state.opened.push(action.payload);
    },
    // The top bar's Help button: the panel's start page
    helpToggled: state => {
      state.helpRequest = undefined;
      state.helpOpen = !state.helpOpen;
    },
    // A section's "Need help?" (with its article), or help in general
    helpOpened: (state, action: PayloadAction<{ slug?: string; at: number }>) => {
      const { slug, at } = action.payload;
      state.helpRequest = slug ? { slug, at } : undefined;
      state.helpOpen = true;
    },
    helpClosed: state => {
      state.helpOpen = false;
    },
    tourStarted: (state, action: PayloadAction<HelpArticle>) => {
      state.tour = action.payload;
      state.tourStep = 0;
    },
    // Next (or what's highlighted was clicked): past the last step, the tour ends
    tourStepAdvanced: state => {
      state.tourStep += 1;
      if (state.tourStep >= (state.tour?.tour?.length ?? 0)) state.tour = undefined;
    },
    tourStepBack: state => {
      state.tourStep = Math.max(0, state.tourStep - 1);
    },
    tourEnded: state => {
      state.tour = undefined;
    },
  },
});

const { areaShown } = appSlice.actions;
// helpOpened, helpToggled and helpClosed also start the help panel's own state (help/helpSlice.ts)
export const { helpToggled, helpOpened, helpClosed, tourStarted, tourStepAdvanced, tourStepBack, tourEnded } =
  appSlice.actions;
export const appReducer = appSlice.reducer;

export const selectApp = (state: RootState) => state.app;

// Shows an area, and puts it in the URL so a reload comes back to it
export const switchArea =
  (area: Area): AppThunk =>
  dispatch => {
    dispatch(areaShown(area));
    const params = new URLSearchParams(window.location.search);
    params.set('area', area);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

export const openHelp =
  (slug?: string): AppThunk =>
  dispatch => {
    dispatch(helpOpened({ slug, at: Date.now() }));
  };
