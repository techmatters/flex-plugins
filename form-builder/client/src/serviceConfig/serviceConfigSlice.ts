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
 * The service configuration editor (Aselo staff only): which settings are shown, which one is
 * open, the setting being added, and JSON being typed (for a setting, or a whole file) until
 * it's valid. Every change is written to the draft's service-configuration files
 * (serviceConfig.ts). Helpline features are switched here too (helplineFeatures.ts), since
 * they're settings in the same files.
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import { isServiceConfigPath, ServiceConfigFileName } from '@tech-matters/form-builder-shared';
import type { DefinitionFileMap } from '../common/definitions';
import { AppThunk, rootReducer, RootState } from '../app/store';
import { editDraftFiles, selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { selectDefinitions } from '../workspace/workspaceSlice';
import {
  ConfigObject,
  describeSetting,
  differsBetweenEnvironments,
  getSettingRows,
  isConfigObject,
  isSetByHelpline,
  parseSettingPath,
  setServiceConfigFile,
  setServiceConfigValue,
} from './serviceConfig';
import { HelplineFeatures, setFeature } from './helplineFeatures';

export type SettingsFilter = 'helpline' | 'all' | 'differs' | 'changed';

// Text being typed, and why it isn't saved (not valid JSON) when it isn't
export type JsonText = { text: string; error?: string };

export type ServiceConfigState = {
  mode: 'settings' | 'files';
  filter: SettingsFilter;
  search: string;
  // The path of the setting whose per-file editor is open
  openPath?: string;
  fileTab: ServiceConfigFileName | 'defaults';
  // The setting being added
  add: { pathText: string; fileName: ServiceConfigFileName; valueText: string; error?: string };
  // JSON typed for the open setting, by `${path}:${file name}` (until then, the file's value is shown)
  settingJson: Record<string, JsonText>;
  // JSON typed for the file on fileTab (until then, the file as it is is shown)
  fileJson?: JsonText;
};

const initialState: ServiceConfigState = {
  mode: 'settings',
  filter: 'helpline',
  search: '',
  fileTab: 'common',
  add: { pathText: '', fileName: 'common', valueText: '' },
  settingJson: {},
};

const serviceConfigSlice = createSlice({
  name: 'serviceConfig',
  initialState,
  reducers: {
    serviceConfigOpened: () => initialState,
    modeChanged: (state, action: PayloadAction<ServiceConfigState['mode']>) => {
      state.mode = action.payload;
      state.fileJson = undefined;
    },
    filterChanged: (state, action: PayloadAction<SettingsFilter>) => {
      state.filter = action.payload;
    },
    searchChanged: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    settingToggled: (state, action: PayloadAction<string>) => {
      state.openPath = state.openPath === action.payload ? undefined : action.payload;
      state.settingJson = {};
    },
    fileTabChanged: (state, action: PayloadAction<ServiceConfigState['fileTab']>) => {
      state.fileTab = action.payload;
      state.fileJson = undefined;
    },
    addChanged: (state, action: PayloadAction<Partial<ServiceConfigState['add']>>) => {
      state.add = { ...state.add, ...action.payload };
    },
    settingJsonChanged: (state, action: PayloadAction<{ key: string; json?: JsonText }>) => {
      const { key, json } = action.payload;
      if (json) state.settingJson[key] = json;
      else delete state.settingJson[key];
    },
    fileJsonChanged: (state, action: PayloadAction<JsonText>) => {
      state.fileJson = action.payload;
    },
    settingAdded: (state, action: PayloadAction<string>) => {
      state.add = { ...state.add, pathText: '', valueText: '', error: undefined };
      state.filter = 'helpline';
      state.search = '';
      state.openPath = action.payload;
      state.settingJson = {};
    },
  },
  selectors: {
    selectServiceConfig: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof serviceConfigSlice> {}
}
const injected = serviceConfigSlice.injectInto(rootReducer);
export const { selectServiceConfig } = injected.selectors;
const { serviceConfigOpened, settingJsonChanged, fileJsonChanged, settingAdded } = serviceConfigSlice.actions;
export const { modeChanged, filterChanged, searchChanged, settingToggled, fileTabChanged, addChanged } =
  serviceConfigSlice.actions;

const selectServiceConfigDefaults = (state: RootState): ConfigObject | undefined =>
  selectDefinitions(state)?.serviceConfigDefaults;

export const selectSettingRows = createSelector([selectDraftFiles, selectServiceConfigDefaults], getSettingRows);

// Each setting's values per file as loaded, by path, to tell which ones this draft changed
const selectOriginalSettingValues = createSelector(
  [selectOriginalFiles, selectServiceConfigDefaults],
  (files, defaults) => new Map(getSettingRows(files, defaults).map((row) => [row.path, JSON.stringify(row.byLayer)])),
);

export const selectChangedSettingPaths = createSelector(
  [selectSettingRows, selectOriginalSettingValues],
  (rows, original) => new Set(rows.filter((row) => original.get(row.path) !== JSON.stringify(row.byLayer)).map((row) => row.path)),
);

// The settings the filter and search let through
export const selectVisibleSettingRows = createSelector(
  [
    selectSettingRows,
    selectChangedSettingPaths,
    (state: RootState) => selectServiceConfig(state).filter,
    (state: RootState) => selectServiceConfig(state).search,
  ],
  (rows, changed, filter, search) => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'helpline' && !isSetByHelpline(row)) return false;
      if (filter === 'differs' && !differsBetweenEnvironments(row)) return false;
      if (filter === 'changed' && !changed.has(row.path)) return false;
      if (!query) return true;
      return `${row.path} ${describeSetting(row) ?? ''}`.toLowerCase().includes(query);
    });
  },
);

export const settingJsonKey = (path: string, name: ServiceConfigFileName) => `${path}:${name}`;

const parseLoose = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// Starts the editor again (when it opens, and when the draft's files are replaced)
export const openServiceConfig = (): AppThunk => (dispatch) => {
  dispatch(serviceConfigOpened());
};

// Writes the service-configuration files; a file the helpline didn't have, emptied again, isn't created
export const editServiceConfig =
  (updater: (files: DefinitionFileMap) => DefinitionFileMap): AppThunk =>
  (dispatch, getState) => {
    const originalFiles = getState().draft.original;
    const isNewEmptyFile = (filePath: string, value: unknown) =>
      isServiceConfigPath(filePath) &&
      !(filePath in originalFiles) &&
      isConfigObject(value) &&
      Object.keys(value).length === 0;
    dispatch(
      editDraftFiles((files) =>
        Object.fromEntries(Object.entries(updater(files)).filter(([filePath, value]) => !isNewEmptyFile(filePath, value))),
      ),
    );
  };

// Sets (or, with undefined, removes) a setting in one file; JSON being typed for it starts again from it
export const setSettingValue =
  (path: string, keys: string[], name: ServiceConfigFileName, value: unknown): AppThunk =>
  (dispatch) => {
    dispatch(settingJsonChanged({ key: settingJsonKey(path, name) }));
    dispatch(editServiceConfig((files) => setServiceConfigValue(files, name, keys, value)));
  };

// JSON typed for a setting in one file, saved whenever it's valid
export const typeSettingJson =
  (path: string, keys: string[], name: ServiceConfigFileName, text: string): AppThunk =>
  (dispatch) => {
    const key = settingJsonKey(path, name);
    try {
      const value = JSON.parse(text);
      dispatch(editServiceConfig((files) => setServiceConfigValue(files, name, keys, value)));
      dispatch(settingJsonChanged({ key, json: { text } }));
    } catch (err) {
      dispatch(settingJsonChanged({ key, json: { text, error: (err as Error).message } }));
    }
  };

// Adds the setting typed in "Add a setting", then shows it open
export const addSetting = (): AppThunk => (dispatch, getState) => {
  const { pathText, fileName, valueText } = selectServiceConfig(getState()).add;
  const keys = parseSettingPath(pathText);
  if (!keys) {
    dispatch(addChanged({ error: 'Write the setting as a dotted path, e.g. attributes.feature_flags.enable_lex' }));
    return;
  }
  const path = keys.join('.');
  const existing = selectSettingRows(getState()).find((row) => row.path === path);
  if (existing && existing.byLayer[fileName] !== undefined) {
    dispatch(addChanged({ error: `${fileName}.json already sets ${path}: change it in the list above.` }));
    return;
  }
  if (valueText.trim() === '') {
    dispatch(addChanged({ error: 'Give it a value.' }));
    return;
  }
  dispatch(editServiceConfig((files) => setServiceConfigValue(files, fileName, keys, parseLoose(valueText.trim()))));
  dispatch(settingAdded(path));
};

// A whole file typed as JSON, saved into the draft whenever it's valid
export const typeFileJson =
  (text: string): AppThunk =>
  (dispatch, getState) => {
    const { fileTab } = selectServiceConfig(getState());
    if (fileTab === 'defaults') return;
    try {
      const parsed = JSON.parse(text);
      if (!isConfigObject(parsed)) throw new Error('The file must be a JSON object ({ … }).');
      dispatch(editServiceConfig((files) => setServiceConfigFile(files, fileTab, parsed)));
      dispatch(fileJsonChanged({ text }));
    } catch (err) {
      dispatch(fileJsonChanged({ text, error: (err as Error).message }));
    }
  };

// Switches a helpline feature on or off (FeaturesEditor)
export const switchFeature =
  (feature: keyof HelplineFeatures, on: boolean): AppThunk =>
  (dispatch) => {
    dispatch(editDraftFiles((files) => setFeature(files, feature, on)));
  };
