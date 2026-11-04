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
 * The webchat form editor: the language being edited, the questions (as rows: the editor owns
 * their order while it's open), which one is open, the add menu and linked dropdown dialogs, and
 * what's filled in in the preview. Every change is written to the draft's
 * webchat/PreEngagementForm.json and the helpline's webchat translations (webchat.ts).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { FormItemJsonDefinition, SelectOption } from '@hrm-form-definitions/formDefinition/types';
import { AppThunk, RootState, rootReducer } from '../app/store';
import type { DefinitionFileMap } from '../common/definitions';
import { editDraftFiles, selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { selectDefinitions } from '../workspace/workspaceSlice';
import { getFeatures } from '../serviceConfig/helplineFeatures';
import { Row, toRows } from '../common/SortableRows';
import {
  AnswerNode,
  applyChainOptions,
  chainToTree,
  ChainTree,
  createChainFields,
  makeKeyValuesUnique,
  treeToChainOptions,
} from '../linkedDropdowns/linkedDropdowns';
import {
  buildTextContext,
  changeWebchatFieldType,
  createWebchatField,
  getPreEngagementForm,
  getWebchatLocales,
  localizeField,
  PRE_ENGAGEMENT_FILE,
  renamePrepopulateTargets,
  setPrepopulateTargets,
  setWebchatText,
  unlocalizeField,
  WebchatField,
  WebchatFieldType,
  withTranslations,
} from './webchat';

// An answer in the preview
export type PreviewValue = string | boolean;

export type EditingChain = { fields: WebchatField[]; tree: ChainTree; notes: string[] };

export type WebchatState = {
  locale?: string;
  rows: Row<WebchatField>[];
  selectedId?: string;
  // The menu of kinds of question to add is open
  adding: boolean;
  wizardOpen: boolean;
  // Linked dropdowns whose answers are being edited
  editingChain?: EditingChain;
  // The preview, as a visitor fills it in
  preview: { values: Record<string, PreviewValue>; touched: string[]; started: boolean };
};

const initialPreview: WebchatState['preview'] = { values: {}, touched: [], started: false };
const initialState: WebchatState = { rows: [], adding: false, wizardOpen: false, preview: initialPreview };

const webchatSlice = createSlice({
  name: 'webchat',
  initialState,
  reducers: {
    webchatOpened: (_state, action: PayloadAction<{ locale: string; rows: Row<WebchatField>[] }>) => ({
      ...initialState,
      ...action.payload,
    }),
    // Each language starts with an empty preview
    localeSelected: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
      state.preview = initialPreview;
    },
    rowsChanged: (state, action: PayloadAction<Row<WebchatField>[]>) => {
      state.rows = action.payload;
    },
    questionSelected: (state, action: PayloadAction<string | undefined>) => {
      state.selectedId = action.payload;
    },
    addingSet: (state, action: PayloadAction<boolean>) => {
      state.adding = action.payload;
    },
    wizardOpened: state => {
      state.adding = false;
      state.wizardOpen = true;
    },
    wizardClosed: state => {
      state.wizardOpen = false;
    },
    chainOpened: (state, action: PayloadAction<EditingChain>) => {
      state.editingChain = action.payload;
    },
    chainClosed: state => {
      state.editingChain = undefined;
    },
    previewAnswersChanged: (
      state,
      action: PayloadAction<{ values: Record<string, PreviewValue>; touched: string }>,
    ) => {
      state.preview.values = action.payload.values;
      if (!state.preview.touched.includes(action.payload.touched)) state.preview.touched.push(action.payload.touched);
    },
    previewStartedSet: (state, action: PayloadAction<boolean>) => {
      state.preview.started = action.payload;
    },
  },
  selectors: {
    selectWebchat: state => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof webchatSlice> {}
}
const injected = webchatSlice.injectInto(rootReducer);
export const { selectWebchat } = injected.selectors;
const { webchatOpened, rowsChanged, chainOpened, previewAnswersChanged } = webchatSlice.actions;
export const {
  localeSelected,
  questionSelected,
  addingSet,
  wizardOpened,
  wizardClosed,
  chainClosed,
  previewStartedSet,
} = webchatSlice.actions;

// The languages the webchat has texts for (its default language when it has none)
export const selectWebchatLocales = createSelector(
  [selectOriginalFiles, (state: RootState) => selectDefinitions(state)?.webchat?.defaultLocale ?? 'en-US'],
  (originalFiles, defaultLocale) => {
    const found = getWebchatLocales(originalFiles, defaultLocale);
    return found.length > 0 ? found : [defaultLocale];
  },
);

// Whether the helpline reads PrepopulateMappings.json: the service config's setting, else its feature flag
export const selectUsesPrepopulateMappings = (state: RootState) => {
  const definitions = selectDefinitions(state);
  const features = getFeatures(selectDraftFiles(state), definitions?.serviceConfigDefaults);
  return features
    ? features.usePrepopulateMappings === true
    : definitions?.featureFlags?.use_prepopulate_mappings === true;
};

// The texts in the language being edited
export const selectWebchatTextContext = createSelector(
  [selectDraftFiles, (state: RootState) => selectWebchat(state).locale, selectWebchatLocales],
  (files, locale, locales) => buildTextContext(files, locale ?? locales[0], locales),
);

// Chain fields as the shared linked dropdown code expects them
export const asFormItems = (fields: WebchatField[]) => fields as unknown as FormItemJsonDefinition[];
const asWebchatFields = (items: FormItemJsonDefinition[]) => items as unknown as WebchatField[];

// New chain fields come in the contact form's shape; the webchat's are simpler
const toWebchatChainField = (item: FormItemJsonDefinition, isNewTop: boolean): WebchatField => {
  const { isPII, defaultOption, ...rest } = item as unknown as WebchatField & {
    isPII?: boolean;
    defaultOption?: unknown;
  };
  return { ...rest, required: false, ...(isNewTop ? { defaultValue: '' } : {}) } as WebchatField;
};

// Starts editing the form in its first language, from the draft
export const openWebchatForm = (): AppThunk => (dispatch, getState) => {
  const [locale] = selectWebchatLocales(getState());
  dispatch(webchatOpened({ locale, rows: toRows(getPreEngagementForm(getState().draft.files)?.fields ?? []) }));
};

// Writes the questions back to the draft, plus any texts for this language's translations
const write =
  (
    next: Row<WebchatField>[],
    translations: [string, string][] = [],
    alsoChange: (files: DefinitionFileMap) => DefinitionFileMap = files => files,
  ): AppThunk =>
  (dispatch, getState) => {
    const { locale } = selectWebchatTextContext(getState());
    dispatch(rowsChanged(next));
    dispatch(
      editDraftFiles(files =>
        alsoChange(
          withTranslations(
            {
              ...files,
              [PRE_ENGAGEMENT_FILE]: { ...getPreEngagementForm(files), fields: next.map(row => row.value) },
            },
            locale,
            translations,
          ),
        ),
      ),
    );
  };

export const reorderQuestions = (next: Row<WebchatField>[]): AppThunk => write(next);

// Saves edited (localized) questions, matched to the stored ones by name
const saveLocalized =
  (edited: WebchatField[], insertAfter?: string): AppThunk =>
  (dispatch, getState) => {
    const context = selectWebchatTextContext(getState());
    const { rows } = selectWebchat(getState());
    const translations: [string, string][] = [];
    const storedByName = new Map(rows.map(row => [row.value.name, row.value]));
    const unlocalize = (field: WebchatField, stored = storedByName.get(field.name)) => {
      const result = unlocalizeField(field, stored, context);
      translations.push(...result.translations);
      return result.field;
    };
    const editedByName = new Map(edited.map(field => [field.name, field]));
    let next = rows.map(row => {
      const field = editedByName.get(row.value.name);
      return field ? { ...row, value: unlocalize(field) } : row;
    });
    const added = edited.filter(field => !storedByName.has(field.name));
    if (added.length > 0) {
      const newRows = toRows(added.map(field => unlocalize(field, undefined)));
      const index = insertAfter ? next.findIndex(row => row.value.name === insertAfter) : -1;
      next = index >= 0 ? [...next.slice(0, index + 1), ...newRows, ...next.slice(index + 1)] : [...next, ...newRows];
      dispatch(questionSelected(newRows[0].id));
    }
    dispatch(write(next, translations));
  };

export const updateQuestion =
  (id: string, edited: WebchatField): AppThunk =>
  (dispatch, getState) => {
    const { rows } = selectWebchat(getState());
    const row = rows.find(candidate => candidate.id === id);
    if (!row) return;
    const { field, translations } = unlocalizeField(edited, row.value, selectWebchatTextContext(getState()));
    dispatch(
      write(
        rows.map(candidate => (candidate.id === id ? { ...candidate, value: field } : candidate)),
        translations,
        // A new question's name follows its text; what it fills in follows the name
        files => renamePrepopulateTargets(files, row.value.name, field.name),
      ),
    );
  };

// A question switched to another kind of answer (the kinds' rules in webchat.ts)
export const changeQuestionType = (id: string, edited: WebchatField, type: WebchatFieldType): AppThunk =>
  updateQuestion(id, changeWebchatFieldType(edited, type));

export const addQuestion =
  (type: WebchatFieldType): AppThunk =>
  (dispatch, getState) => {
    const { rows } = selectWebchat(getState());
    const [row] = toRows([
      createWebchatField(
        type,
        rows.map(candidate => candidate.value.name),
      ),
    ]);
    dispatch(write([...rows, row]));
    dispatch(questionSelected(row.id));
    dispatch(addingSet(false));
  };

export const removeQuestion =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const { rows } = selectWebchat(getState());
    const row = rows.find(candidate => candidate.id === id);
    if (!row) return;
    dispatch(
      write(
        rows.filter(candidate => candidate.id !== id),
        [],
        files => setPrepopulateTargets(files, row.value.name, []),
      ),
    );
    dispatch(questionSelected(undefined));
  };

export const setQuestionTargets =
  (name: string, targets: string[]): AppThunk =>
  dispatch =>
    dispatch(editDraftFiles(files => setPrepopulateTargets(files, name, targets)));

// One of the texts around the form, in the language being edited
export const setText =
  (key: string, text: string): AppThunk =>
  (dispatch, getState) => {
    const { locale } = selectWebchatTextContext(getState());
    const originalFiles = getState().draft.original;
    dispatch(editDraftFiles(files => setWebchatText(files, originalFiles, locale, key, text)));
  };

/**
 * Linked dropdowns: the same answer tree as the contact forms, but the webchat has no
 * ReferenceData.json, so every list stays in the form.
 */
const buildChain = (
  chainFields: WebchatField[],
  roots: AnswerNode[],
  tree: Pick<ChainTree, 'rootBlankOption' | 'unusedLists'>,
  replacedByImport: boolean,
) => {
  const unique = makeKeyValuesUnique(roots, chainFields.length, { fixExisting: replacedByImport });
  const options = treeToChainOptions(
    unique.roots,
    chainFields.length,
    tree.rootBlankOption,
    replacedByImport ? [] : tree.unusedLists,
  );
  return asWebchatFields(applyChainOptions(asFormItems(chainFields), options, {}, Infinity).fields);
};

// The questions with their texts in the language being edited
const localizedFields = (state: RootState) => {
  const { strings } = selectWebchatTextContext(state);
  return selectWebchat(state).rows.map(row => localizeField(row.value, strings));
};

export const openChainEditor =
  (names: string[]): AppThunk =>
  (dispatch, getState) => {
    const localizedByName = new Map(localizedFields(getState()).map(field => [field.name, field]));
    const chainFields = names.map(name => localizedByName.get(name)!);
    const tree = chainToTree(asFormItems(chainFields), {});
    const notes: string[] = [];
    if (tree.sharedValues.length > 0) {
      notes.push(
        `${tree.sharedValues.length} answer(s) share a name with another answer at the same level (e.g. “${tree.sharedValues[0]}”), so they show the same answers below them. To give each its own list, download as Excel and import it again.`,
      );
    }
    if (tree.unusedLists.length > 0) {
      notes.push(
        `${tree.unusedLists.length} list(s) of answers are filed under an answer that doesn't exist (e.g. “${tree.unusedLists[0].key}”), so visitors never see them. They're kept unless you import from a spreadsheet.`,
      );
    }
    dispatch(chainOpened({ fields: chainFields, tree, notes }));
  };

export const saveChainAnswers =
  (roots: AnswerNode[], { replacedByImport }: { replacedByImport: boolean }): AppThunk =>
  (dispatch, getState) => {
    const { editingChain } = selectWebchat(getState());
    if (!editingChain) return;
    dispatch(saveLocalized(buildChain(editingChain.fields, roots, editingChain.tree, replacedByImport)));
    dispatch(chainClosed());
  };

export const createChain =
  (levelLabels: string[], roots: AnswerNode[], existingTop?: FormItemJsonDefinition): AppThunk =>
  (dispatch, getState) => {
    const created = createChainFields(
      levelLabels,
      selectWebchat(getState()).rows.map(row => row.value.name),
      existingTop,
      '',
    ).map((item, level) =>
      level === 0 && existingTop ? (item as unknown as WebchatField) : toWebchatChainField(item, level === 0),
    );
    const rootBlankOption = existingTop ? chainToTree([existingTop], {}).rootBlankOption : { value: '', label: '' };
    dispatch(saveLocalized(buildChain(created, roots, { rootBlankOption, unusedLists: [] }, false), existingTop?.name));
    dispatch(wizardClosed());
  };

// An answer in the preview
export const answerPreview =
  (fields: WebchatField[], name: string, value: PreviewValue): AppThunk =>
  (dispatch, getState) => {
    const next = { ...selectWebchat(getState()).preview.values, [name]: value };
    // Like DependentSelect: when the answer above changes, the one below resets to its first answer
    fields
      .filter(field => field.type === 'dependent-select' && field.dependsOn === name)
      .forEach(field => {
        const list = (field.options as Record<string, SelectOption[]> | undefined)?.[String(value)];
        next[field.name] = list?.[0] ? String(list[0].value) : '';
      });
    dispatch(previewAnswersChanged({ values: next, touched: name }));
  };
