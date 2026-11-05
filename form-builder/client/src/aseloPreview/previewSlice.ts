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
 * The full-screen "Try it out" preview (FlexDesktopPreview): the sample task's channel, the
 * language shown, the canned response put in the message box, and the contact form as a
 * counselor fills it in (AseloContactPanel): the call type chosen, the tab open, the answers and
 * categories, and what "Save and End" found. The form itself comes from the draft. It starts
 * again each time the preview opens (openPreview) and is cleared when it closes.
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { CategoriesDefinition, FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';

import { AppThunk, rootReducer } from '../app/store';
import {
  CONTACT_TABS,
  type ContactTab,
  type DefinitionFileMap,
  getCategoriesByHelpline,
  getForm,
  getReferenceData,
} from '../common/definitions';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions, tryItOutClosed, tryItOutOpened } from '../workspace/workspaceSlice';
import { countSelected, DEFAULT_MAXIMUM_SELECTIONS, SelectedCategories } from './AseloCategories';
import { FieldValue, FormValues, initialValueFor, validateField } from './aseloFields';

export type Channel = 'chat' | 'call';
// What the preview opens on, depending on what's being edited
export type PreviewFocus = 'form' | 'callTypes' | 'cannedResponses' | 'messages';
export type TabId = 'search' | ContactTab['key'] | 'categories';
type CallType = 'child' | 'caller';
type SaveResult = 'saved' | 'invalid';

type ContactTabKey = ContactTab['key'];

type PreviewState = {
  // False until openPreview has set it up for the preview being shown
  opened: boolean;
  channel: Channel;
  language: string;
  // What Aselo would do with the contact, once the counselor saves or ends it
  saveResult?: SaveResult;
  // The canned response chosen, shown in the message box
  message: string;
  // The "categorize this contact" screen, or the form
  screen: 'callTypes' | 'form';
  callType: CallType;
  tabIndex: number;
  values: Record<ContactTabKey, FormValues>;
  selectedCategories: SelectedCategories;
  // Like the plugin's form library: errors show after the first save attempt, then update live
  submitted: boolean;
};

const initialState: PreviewState = {
  opened: false,
  channel: 'chat',
  language: 'en-US',
  message: '',
  screen: 'form',
  callType: 'child',
  tabIndex: 1,
  values: { CallerInformationTab: {}, ChildInformationTab: {}, CaseInformationTab: {} },
  selectedCategories: {},
  submitted: false,
};

const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    previewOpened: (_state, action: PayloadAction<Omit<PreviewState, 'opened'>>) => ({
      ...action.payload,
      opened: true,
    }),
    channelChanged: (state, action: PayloadAction<Channel>) => {
      state.channel = action.payload;
    },
    languageChanged: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    cannedResponseChosen: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    tabSelected: (state, action: PayloadAction<number>) => {
      state.tabIndex = action.payload;
    },
    backToCallTypes: state => {
      state.screen = 'callTypes';
    },
    dataCallTypeChosen: (state, action: PayloadAction<CallType>) => {
      state.callType = action.payload;
      state.tabIndex = 1;
      state.screen = 'form';
      state.saveResult = undefined;
    },
    // A call type that closes the contact without a form (e.g. a silent or joke contact)
    nonDataCallTypeChosen: state => {
      state.saveResult = 'saved';
    },
    answersChanged: (state, action: PayloadAction<{ tabKey: ContactTabKey; values: FormValues }>) => {
      state.values[action.payload.tabKey] = action.payload.values;
      state.saveResult = undefined;
    },
    categoriesChanged: (state, action: PayloadAction<SelectedCategories>) => {
      state.selectedCategories = action.payload;
      state.saveResult = undefined;
    },
    saveAttempted: (state, action: PayloadAction<SaveResult>) => {
      state.submitted = true;
      state.saveResult = action.payload;
    },
  },
  extraReducers: builder => {
    // Each preview starts afresh
    builder.addCase(tryItOutOpened, () => initialState).addCase(tryItOutClosed, () => initialState);
  },
  selectors: {
    selectPreview: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof previewSlice> {}
}
const injected = previewSlice.injectInto(rootReducer);
export const { selectPreview } = injected.selectors;
const { previewOpened, answersChanged, saveAttempted } = previewSlice.actions;
export const {
  channelChanged,
  languageChanged,
  cannedResponseChosen,
  tabSelected,
  backToCallTypes,
  nonDataCallTypeChosen,
  categoriesChanged,
} = previewSlice.actions;

// IssueCategorizationTab is keyed by helpline name; contacts use the default helpline
const categoriesForDefaultHelpline = (files: DefinitionFileMap): CategoriesDefinition | undefined => {
  const byHelpline = getCategoriesByHelpline(files);
  const info = files['HelplineInformation.json'] as { helplines?: { value: string; default?: boolean }[] } | undefined;
  const helplines = info?.helplines ?? [];
  const defaultHelpline = (helplines.find(h => h.default) ?? helplines[0])?.value;
  return (defaultHelpline && byHelpline[defaultHelpline]) || Object.values(byHelpline)[0];
};

const formsOf = (files: DefinitionFileMap) =>
  Object.fromEntries(CONTACT_TABS.map(tab => [tab.key, getForm(files, tab.filePath) ?? []])) as Record<
    ContactTabKey,
    FormItemJsonDefinition[]
  >;

// The search tab, then Caller (only when someone calls about another person), Child, Categories and Summary
const tabsFor = (callType: CallType): TabId[] => [
  'search',
  ...(callType === 'caller' ? (['CallerInformationTab'] as const) : []),
  'ChildInformationTab',
  'categories',
  'CaseInformationTab',
];

const contactTabsIn = (tabs: TabId[]) =>
  tabs.filter((tab): tab is ContactTabKey => tab !== 'search' && tab !== 'categories');

// The contact form as it stands: its tabs, the one open, and (after a save attempt) what needs attention
export const selectContactPanel = createSelector([selectPreview, selectDraftFiles], (preview, files) => {
  const referenceData = getReferenceData(files);
  const forms = formsOf(files);
  const categories = categoriesForDefaultHelpline(files);
  const maxSelections = categories?.maxSelections ?? DEFAULT_MAXIMUM_SELECTIONS;
  const tabs = tabsFor(preview.callType);
  const errorsByTab = Object.fromEntries(
    contactTabsIn(tabs).map(tabKey => [
      tabKey,
      preview.submitted
        ? Object.fromEntries(
            forms[tabKey].map(item => [item.name, validateField(item, preview.values[tabKey], referenceData)]),
          )
        : {},
    ]),
  ) as Record<ContactTabKey, Record<string, string | undefined>>;
  const selectedCount = countSelected(preview.selectedCategories);
  const categoriesInvalid = preview.submitted && (selectedCount < 1 || selectedCount > maxSelections);
  return {
    referenceData,
    forms,
    categories,
    tabs,
    currentTab: tabs[Math.min(preview.tabIndex, tabs.length - 1)],
    isLastTab: preview.tabIndex === tabs.length - 1,
    errorsByTab,
    categoriesInvalid,
  };
});

// Sets the preview up for what it was opened on (workspace tryItOut), from the draft
export const openPreview = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { tryItOut } = state.workspace;
  const { files } = state.draft;
  const referenceData = getReferenceData(files);
  const initialTab = tryItOut?.tab as ContactTabKey | 'categories' | undefined;
  const hasCallerForm = (getForm(files, CONTACT_TABS[0].filePath) ?? []).length > 0;
  const callType: CallType = initialTab === 'CallerInformationTab' && hasCallerForm ? 'caller' : 'child';
  dispatch(
    previewOpened({
      channel: 'chat',
      language: selectDefinitions(state)?.helplineLanguage ?? 'en-US',
      message: '',
      screen: (tryItOut?.focus ?? 'form') === 'form' ? 'form' : 'callTypes',
      callType,
      tabIndex: Math.max(1, tabsFor(callType).indexOf(initialTab ?? 'ChildInformationTab')),
      values: Object.fromEntries(
        CONTACT_TABS.map(tab => [
          tab.key,
          Object.fromEntries(
            (getForm(files, tab.filePath) ?? []).map(item => [item.name, initialValueFor(item, referenceData)]),
          ),
        ]),
      ) as Record<ContactTabKey, FormValues>,
      selectedCategories: {},
      submitted: false,
    }),
  );
};

export const setPreviewAnswer =
  (tabKey: ContactTabKey, name: string, value: FieldValue): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const files = selectDraftFiles(state);
    const referenceData = getReferenceData(files);
    const tabValues = { ...selectPreview(state).values[tabKey], [name]: value };
    // A linked dropdown goes back to its blank answer when the one above changes
    formsOf(files)
      [tabKey].filter(item => item.type === 'dependent-select' && item.dependsOn === name)
      .forEach(item => {
        tabValues[item.name] = initialValueFor(item, referenceData);
      });
    dispatch(answersChanged({ tabKey, values: tabValues }));
  };

export const nextPreviewTab = (): AppThunk => (dispatch, getState) =>
  dispatch(tabSelected(selectPreview(getState()).tabIndex + 1));

// Call types that open the form: "caller" adds the Caller tab
export const chooseDataCallType =
  (name: string): AppThunk =>
  dispatch =>
    dispatch(previewSlice.actions.dataCallTypeChosen(name === 'caller' ? 'caller' : 'child'));

// "Save and End": checks the answers the way Aselo does
export const saveAndEnd = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const preview = selectPreview(state);
  const files = selectDraftFiles(state);
  const referenceData = getReferenceData(files);
  const forms = formsOf(files);
  const maxSelections = categoriesForDefaultHelpline(files)?.maxSelections ?? DEFAULT_MAXIMUM_SELECTIONS;
  const selectedCount = countSelected(preview.selectedCategories);
  const invalid =
    contactTabsIn(tabsFor(preview.callType)).some(tabKey =>
      forms[tabKey].some(item => validateField(item, preview.values[tabKey], referenceData)),
    ) ||
    selectedCount < 1 ||
    selectedCount > maxSelections;
  dispatch(saveAttempted(invalid ? 'invalid' : 'saved'));
};
