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
 * The formSelector editor (FormSelectorEditor.tsx): what the other selectorType held, so switching
 * back and forth doesn't lose it. The selector itself is read from, and written to, the draft's
 * PrepopulateMappings.json (formSelector.ts).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';

import { AppThunk, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { selectSectionIssues } from '../workspace/workspaceSlice';
import {
  CALL_TYPE_CHILD,
  DEFAULT_CHOICES,
  FORM_SELECTOR_PREFIX,
  FormSelector,
  readFormSelector,
  removeFormSelector,
  setFormSelector,
} from './formSelector';

export type StaticSelector = Extract<FormSelector, { kind: 'static' }>;
export type ChoiceSelector = Extract<FormSelector, { kind: 'choice' }>;
export type SelectorType = '' | 'staticSelector' | 'serviceUserChoiceSelector';

type FormSelectorState = {
  remembered: { static?: StaticSelector; choice?: ChoiceSelector };
};

const initialState: FormSelectorState = { remembered: {} };

const NEW_STATIC: StaticSelector = {
  kind: 'static',
  tabs: ['ChildInformationTab', 'CaseInformationTab'],
  callType: CALL_TYPE_CHILD,
};

const formSelectorSlice = createSlice({
  name: 'formSelector',
  initialState,
  reducers: {
    formSelectorOpened: () => initialState,
    selectorRemembered: (state, action: PayloadAction<FormSelector>) => {
      if (action.payload.kind === 'static') state.remembered.static = action.payload;
      else state.remembered.choice = action.payload;
    },
  },
  selectors: {
    selectFormSelectorEditor: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof formSelectorSlice> {}
}
const injected = formSelectorSlice.injectInto(rootReducer);
const { selectFormSelectorEditor } = injected.selectors;
const { selectorRemembered } = formSelectorSlice.actions;
export const { formSelectorOpened } = formSelectorSlice.actions;

export const selectFormSelectorIssues = createSelector([selectSectionIssues], issues =>
  issues.filter(issue => issue.message.startsWith(FORM_SELECTOR_PREFIX)),
);

export const selectorTypeOf = (implicit: boolean, selector: FormSelector): SelectorType =>
  // eslint-disable-next-line no-nested-ternary
  implicit ? '' : selector.kind === 'static' ? 'staticSelector' : 'serviceUserChoiceSelector';

export const writeFormSelector =
  (next: FormSelector): AppThunk =>
  dispatch =>
    dispatch(editDraftFiles(files => setFormSelector(files, next)));

// Another selectorType (or none: the default), with what it held before if it was chosen before
export const switchSelectorType =
  (type: SelectorType): AppThunk =>
  (dispatch, getState) => {
    const info = readFormSelector(getState().draft.files);
    if (type === selectorTypeOf(info.implicit, info.selector)) return;
    if (!info.implicit) dispatch(selectorRemembered(info.selector));
    const { remembered } = selectFormSelectorEditor(getState());
    if (type === '') dispatch(editDraftFiles(removeFormSelector));
    else if (type === 'staticSelector') dispatch(writeFormSelector(remembered.static ?? NEW_STATIC));
    else dispatch(writeFormSelector(remembered.choice ?? { kind: 'choice', choices: DEFAULT_CHOICES }));
  };
