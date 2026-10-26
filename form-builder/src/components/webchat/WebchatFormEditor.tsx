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
 * Edits the webchat's pre-engagement form (webchat/PreEngagementForm.json) and the texts
 * around it, one language at a time, next to a working preview of the webchat.
 *
 * Questions are edited with their texts in the chosen language; when saved, each text goes
 * back where it lives (see updateText in webchat.ts): the helpline's webchat translations
 * for translated texts, or the form itself.
 */
import { useMemo, useState } from 'react';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import type { WebchatSettings } from '../../../server/definitionsApi';
import type { DefinitionFileMap } from '../../definitions';
import { isSameJson } from '../../changes';
import {
  AnswerNode,
  applyChainOptions,
  chainToTree,
  ChainTree,
  createChainFields,
  findChainsThroughField,
  makeKeyValuesUnique,
  treeToChainOptions,
} from '../../linkedDropdowns';
import type { ValidationIssue } from '../../validation';
import {
  ADDABLE_WEBCHAT_FIELD_TYPES,
  buildTextContext,
  createWebchatField,
  findUnmatchedAnswers,
  findWebchatFieldReferences,
  getPrepopulateCandidates,
  getPrepopulateTargets,
  getPreEngagementForm,
  getWebchatLocales,
  isRequired,
  localizeField,
  plainText,
  PRE_ENGAGEMENT_FILE,
  renamePrepopulateTargets,
  setPrepopulateTargets,
  setWebchatText,
  unlocalizeField,
  WEBCHAT_FIELD_TYPE_INFO,
  WEBCHAT_TEXTS,
  WebchatField,
  WebchatFieldType,
  withTranslations,
} from '../../webchat';
import { LinkedAnswersEditor } from '../LinkedAnswersEditor';
import { LinkedDropdownsWizard } from '../LinkedDropdownsWizard';
import { Row, SortableRows, toRows } from '../sections/SortableRows';
import { WebchatFieldSettings } from './WebchatFieldSettings';
import { WebchatPreview } from './WebchatPreview';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  settings?: WebchatSettings;
  featureFlags?: Record<string, boolean>;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

// Chain fields as the shared linked dropdown code expects them
const asFormItems = (fields: WebchatField[]) => fields as unknown as FormItemJsonDefinition[];
const asWebchatFields = (items: FormItemJsonDefinition[]) => items as unknown as WebchatField[];

// New chain fields come in the contact form's shape; the webchat's are simpler
const toWebchatChainField = (item: FormItemJsonDefinition, isNewTop: boolean): WebchatField => {
  const { isPII, defaultOption, ...rest } = item as unknown as WebchatField & {
    isPII?: boolean;
    defaultOption?: unknown;
  };
  return { ...rest, required: false, ...(isNewTop ? { defaultValue: '' } : {}) } as WebchatField;
};

export const WebchatFormEditor = ({
  draftFiles,
  originalFiles,
  staffMode,
  settings,
  featureFlags,
  issues,
  onChangeFiles,
}: Props) => {
  const defaultLocale = settings?.defaultLocale ?? 'en-US';
  const locales = useMemo(() => {
    const found = getWebchatLocales(originalFiles, defaultLocale);
    return found.length > 0 ? found : [defaultLocale];
  }, [originalFiles, defaultLocale]);
  const [locale, setLocale] = useState(locales[0]);
  const context = buildTextContext(draftFiles, locale, locales);

  const originalByName = useMemo(
    () => new Map((getPreEngagementForm(originalFiles)?.fields ?? []).map((field) => [field.name, field])),
    [originalFiles],
  );
  // The editor owns the questions' order while it's open; built once from the draft
  const [rows, setRows] = useState<Row<WebchatField>[]>(() =>
    toRows(getPreEngagementForm(draftFiles)?.fields ?? []),
  );
  const [selectedId, setSelectedId] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<{ fields: WebchatField[]; tree: ChainTree; notes: string[] }>();

  const fields = rows.map((row) => row.value);
  const localized = fields.map((field) => localizeField(field, context.strings));
  const localizedByName = new Map(localized.map((field) => [field.name, field]));

  // Writes the questions back to the draft, plus any texts for this language's translations
  const write = (
    next: Row<WebchatField>[],
    translations: [string, string][] = [],
    alsoChange: (files: DefinitionFileMap) => DefinitionFileMap = (files) => files,
  ) => {
    setRows(next);
    onChangeFiles((files) =>
      alsoChange(
        withTranslations(
          {
            ...files,
            [PRE_ENGAGEMENT_FILE]: { ...getPreEngagementForm(files), fields: next.map((row) => row.value) },
          },
          locale,
          translations,
        ),
      ),
    );
  };

  // Saves edited (localized) questions, matched to the stored ones by name
  const saveLocalized = (edited: WebchatField[], insertAfter?: string) => {
    const translations: [string, string][] = [];
    const storedByName = new Map(fields.map((field) => [field.name, field]));
    const unlocalize = (field: WebchatField, stored = storedByName.get(field.name)) => {
      const result = unlocalizeField(field, stored, context);
      translations.push(...result.translations);
      return result.field;
    };
    const editedByName = new Map(edited.map((field) => [field.name, field]));
    let next = rows.map((row) => {
      const field = editedByName.get(row.value.name);
      return field ? { ...row, value: unlocalize(field) } : row;
    });
    const added = edited.filter((field) => !storedByName.has(field.name));
    if (added.length > 0) {
      const newRows = toRows(added.map((field) => unlocalize(field, undefined)));
      const index = insertAfter ? next.findIndex((row) => row.value.name === insertAfter) : -1;
      next = index >= 0 ? [...next.slice(0, index + 1), ...newRows, ...next.slice(index + 1)] : [...next, ...newRows];
      setSelectedId(newRows[0].id);
    }
    write(next, translations);
  };

  const updateRow = (id: string, edited: WebchatField) => {
    const row = rows.find((candidate) => candidate.id === id)!;
    const { field, translations } = unlocalizeField(edited, row.value, context);
    write(
      rows.map((candidate) => (candidate.id === id ? { ...candidate, value: field } : candidate)),
      translations,
      // A new question's name follows its text; what it fills in follows the name
      (files) => renamePrepopulateTargets(files, row.value.name, field.name),
    );
  };

  const addField = (type: WebchatFieldType) => {
    const [row] = toRows([createWebchatField(type, fields.map((field) => field.name))]);
    write([...rows, row]);
    setSelectedId(row.id);
    setAdding(false);
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

  const openChainEditor = (names: string[]) => {
    const chainFields = names.map((name) => localizedByName.get(name)!);
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
    setEditingChain({ fields: chainFields, tree, notes });
  };

  const createChain = (levelLabels: string[], roots: AnswerNode[], existingTop?: FormItemJsonDefinition) => {
    const created = createChainFields(
      levelLabels,
      fields.map((field) => field.name),
      '',
      existingTop,
    ).map((item, level) =>
      level === 0 && existingTop ? (item as unknown as WebchatField) : toWebchatChainField(item, level === 0),
    );
    const rootBlankOption = existingTop
      ? chainToTree([existingTop], {}).rootBlankOption
      : { value: '', label: '' };
    saveLocalized(buildChain(created, roots, { rootBlankOption, unusedLists: [] }, false), existingTop?.name);
    setWizardOpen(false);
  };

  const prepopulateCandidates = useMemo(() => getPrepopulateCandidates(draftFiles), [draftFiles]);
  const fieldIssues = (name: string) => issues.filter((issue) => issue.fieldName === name);
  const preview = {
    ...getPreEngagementForm(draftFiles),
    fields,
  };

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Webchat form</h2>
          <p className="muted">
            The questions visitors answer on your website before a chat starts. Their answers can
            fill in the contact form for the counselor.
          </p>

          {locales.length > 1 && (
            <div className="language-tabs" role="tablist" aria-label="Language">
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={code === locale}
                  className={code === locale ? 'active' : ''}
                  onClick={() => setLocale(code)}
                >
                  {code}
                </button>
              ))}
            </div>
          )}

          <h3 className="section-heading">Texts</h3>
          {!context.canTranslate && (
            <p className="field-hint">
              This helpline's webchat has no texts of its own for {locale} yet. Ask Aselo staff to
              add them.
            </p>
          )}
          {WEBCHAT_TEXTS.map((info) => {
            const value = context.strings[info.key] ?? '';
            const onChange = (text: string) =>
              onChangeFiles((files) => setWebchatText(files, originalFiles, locale, info.key, text));
            return (
              <label key={info.key} className="field">
                <span className="field-label">{info.title}</span>
                {info.multiline ? (
                  <textarea
                    rows={3}
                    value={value}
                    disabled={!context.canTranslate}
                    onChange={(e) => onChange(e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    disabled={!context.canTranslate}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
                <span className="field-hint">{info.hint}</span>
              </label>
            );
          })}

          <h3 className="section-heading">Questions</h3>
          {rows.length === 0 && (
            <p className="muted">No questions: the chat starts straight away. Add one to ask something first.</p>
          )}
          <SortableRows
            rows={rows}
            labelOf={(field) => plainText(localizeField(field, context.strings).label) || field.name}
            onReorder={(next) => write(next)}
            renderRow={(row) => {
              const field = localizeField(row.value, context.strings);
              const original = originalByName.get(row.value.name);
              const status = !original ? 'new' : isSameJson(original, row.value) ? undefined : 'edited';
              const selected = row.id === selectedId;
              const hasError = fieldIssues(row.value.name).some((issue) => issue.severity === 'error');
              return (
                <div className={`webchat-question${selected ? ' selected' : ''}`}>
                  <button
                    type="button"
                    className="webchat-question-summary"
                    aria-expanded={selected}
                    onClick={() => setSelectedId(selected ? undefined : row.id)}
                  >
                    <span className="webchat-question-label">{plainText(field.label) || 'No question yet'}</span>
                    <span className="muted">
                      {WEBCHAT_FIELD_TYPE_INFO[field.type]?.label ?? field.type}
                      {isRequired(field) ? ' · required' : ''}
                    </span>
                    {hasError && <span className="badge badge-error">Needs attention</span>}
                    {status === 'new' && <span className="badge badge-new">New</span>}
                    {status === 'edited' && <span className="badge badge-edited">Edited</span>}
                  </button>
                  {selected && (
                    <WebchatFieldSettings
                      key={`${row.id}-${field.type}-${locale}`}
                      field={field}
                      originalField={original && localizeField(original, context.strings)}
                      otherNames={fields.filter((other) => other !== row.value).map((other) => other.name)}
                      staffMode={staffMode}
                      linkedChains={findChainsThroughField(asFormItems(localized), field.name)}
                      labelOf={(name) => plainText(localizedByName.get(name)?.label) || name}
                      references={
                        original
                          ? findWebchatFieldReferences(draftFiles, field.name, settings?.contactIdentifierField)
                          : []
                      }
                      issues={fieldIssues(row.value.name)}
                      textIsShared={
                        locales.length > 1 &&
                        (!context.canTranslate || !context.knownKeys.has(String(row.value.label)))
                      }
                      prepopulate={{
                        ...getPrepopulateTargets(draftFiles, row.value.name),
                        candidates: prepopulateCandidates,
                        inUse: featureFlags?.use_prepopulate_mappings === true,
                        unmatchedAnswers: (target) => findUnmatchedAnswers(draftFiles, row.value, target),
                      }}
                      onChangeTargets={(targets) =>
                        onChangeFiles((files) => setPrepopulateTargets(files, row.value.name, targets))
                      }
                      onChange={(edited) => updateRow(row.id, edited)}
                      onEditLinked={openChainEditor}
                      onRemove={() => {
                        write(rows.filter((candidate) => candidate.id !== row.id), [], (files) =>
                          setPrepopulateTargets(files, row.value.name, []),
                        );
                        setSelectedId(undefined);
                      }}
                    />
                  )}
                </div>
              );
            }}
          />

          {adding ? (
            <div className="add-field-menu" role="dialog" aria-label="Choose the kind of question to add">
              <div className="add-field-menu-header">
                <strong>What kind of answer?</strong>
                <button type="button" className="link-button" onClick={() => setAdding(false)}>
                  Cancel
                </button>
              </div>
              <ul>
                {ADDABLE_WEBCHAT_FIELD_TYPES.map((type) => (
                  <li key={type}>
                    <button type="button" className="field-type-option" onClick={() => addField(type)}>
                      <span className="field-type-name">{WEBCHAT_FIELD_TYPE_INFO[type].label}</span>
                      <span className="muted">{WEBCHAT_FIELD_TYPE_INFO[type].description}</span>
                    </button>
                  </li>
                ))}
                <li className="field-type-wide">
                  <button
                    type="button"
                    className="field-type-option"
                    onClick={() => {
                      setAdding(false);
                      setWizardOpen(true);
                    }}
                  >
                    <span className="field-type-name">Linked dropdowns</span>
                    <span className="muted">
                      Two or more dropdowns where each one's answers depend on the one above, like
                      province → district
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <button type="button" className="add-field-button" onClick={() => setAdding(true)}>
              + Add a question
            </button>
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">How it looks in the webchat ({locale})</span>
        </div>
        <div className="section-preview-frame webchat-preview-frame">
          <WebchatPreview key={locale} form={preview} strings={context.strings} />
        </div>
        <p className="field-hint">Fill it in to try it: required questions and answers work as they will for visitors.</p>
      </aside>

      {wizardOpen && (
        <LinkedDropdownsWizard
          formItems={asFormItems(localized)}
          referenceData={{}}
          onCreate={createChain}
          onCancel={() => setWizardOpen(false)}
        />
      )}

      {editingChain && (
        <LinkedAnswersEditor
          title={`Answers for ${editingChain.fields.map((field) => plainText(field.label) || field.name).join(' → ')}`}
          levelLabels={editingChain.fields.map((field) => plainText(field.label) || field.name)}
          initialRoots={editingChain.tree.roots}
          notes={editingChain.notes}
          saveLabel="Save answers"
          downloadName={`webchat-${editingChain.fields.map((field) => field.name).join('-')}.xlsx`}
          onSave={(roots, { replacedByImport }) => {
            saveLocalized(buildChain(editingChain.fields, roots, editingChain.tree, replacedByImport));
            setEditingChain(undefined);
          }}
          onCancel={() => setEditingChain(undefined)}
        />
      )}
    </div>
  );
};
