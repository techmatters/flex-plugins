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
 * for translated texts, or the form itself. What's edited and how lives in webchatSlice.ts.
 */
import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { selectDefinitions, selectSectionIssues, selectWorkspace } from '../workspace/workspaceSlice';
import { isSameJson } from '../drafts/changes';
import { findChainsThroughField } from '../linkedDropdowns/linkedDropdowns';
import {
  ADDABLE_WEBCHAT_FIELD_TYPES,
  findUnmatchedAnswers,
  findWebchatFieldReferences,
  getPrepopulateCandidates,
  getPrepopulateTargets,
  getPreEngagementForm,
  isRequired,
  localizeField,
  plainText,
  WEBCHAT_FIELD_TYPE_INFO,
  WEBCHAT_TEXTS,
} from './webchat';
import {
  addingSet,
  addQuestion,
  asFormItems,
  chainClosed,
  createChain,
  localeSelected,
  openChainEditor,
  openWebchatForm,
  questionSelected,
  removeQuestion,
  reorderQuestions,
  saveChainAnswers,
  selectUsesPrepopulateMappings,
  selectWebchat,
  selectWebchatLocales,
  selectWebchatTextContext,
  setQuestionTargets,
  setText,
  updateQuestion,
  changeQuestionType,
  wizardClosed,
  wizardOpened,
} from './webchatSlice';
import { LinkedAnswersEditor } from '../linkedDropdowns/LinkedAnswersEditor';
import { LinkedDropdownsWizard } from '../linkedDropdowns/LinkedDropdownsWizard';
import { SortableRows } from '../common/SortableRows';
import { WebchatFieldSettings } from './WebchatFieldSettings';
import { WebchatPreview } from './WebchatPreview';
import { SectionTitle } from '../help/HelpContext';

export const WebchatFormEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const originalFiles = useAppSelector(selectOriginalFiles);
  const staffMode = useAppSelector(selectActingAsStaff);
  const settings = useAppSelector(selectDefinitions)?.webchat;
  const usesPrepopulateMappings = useAppSelector(selectUsesPrepopulateMappings);
  const { editorRevision } = useAppSelector(selectWorkspace);
  const issues = useAppSelector(selectSectionIssues).filter(issue => issue.message.startsWith('Webchat form'));
  const locales = useAppSelector(selectWebchatLocales);
  const context = useAppSelector(selectWebchatTextContext);
  const { locale } = context;
  const { rows, selectedId, adding, wizardOpen, editingChain } = useAppSelector(selectWebchat);

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openWebchatForm());
  }, [dispatch, editorRevision]);

  const originalByName = useMemo(
    () => new Map((getPreEngagementForm(originalFiles)?.fields ?? []).map(field => [field.name, field])),
    [originalFiles],
  );

  const fields = rows.map(row => row.value);
  const localized = fields.map(field => localizeField(field, context.strings));
  const localizedByName = new Map(localized.map(field => [field.name, field]));

  const prepopulateCandidates = useMemo(() => getPrepopulateCandidates(draftFiles), [draftFiles]);
  const fieldIssues = (name: string) => issues.filter(issue => issue.fieldName === name);
  const preview = {
    ...getPreEngagementForm(draftFiles),
    fields,
  };

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <SectionTitle>Webchat form</SectionTitle>
          <p className="muted">
            The questions visitors answer on your website before a chat starts. Their answers can fill in the contact
            form for the counselor.
          </p>

          {locales.length > 1 && (
            <div className="language-tabs" role="tablist" aria-label="Language">
              {locales.map(code => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={code === locale}
                  className={code === locale ? 'active' : ''}
                  onClick={() => dispatch(localeSelected(code))}
                >
                  {code}
                </button>
              ))}
            </div>
          )}

          <h3 className="section-heading">Texts</h3>
          {!context.canTranslate && (
            <p className="field-hint">
              This helpline&apos;s webchat has no texts of its own for {locale} yet. Ask Aselo staff to add them.
            </p>
          )}
          {WEBCHAT_TEXTS.map(info => {
            const value = context.strings[info.key] ?? '';
            const onChange = (text: string) => dispatch(setText(info.key, text));
            return (
              <label key={info.key} className="field">
                <span className="field-label">{info.title}</span>
                {info.multiline ? (
                  <textarea
                    rows={3}
                    value={value}
                    disabled={!context.canTranslate}
                    onChange={e => onChange(e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    disabled={!context.canTranslate}
                    onChange={e => onChange(e.target.value)}
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
            labelOf={field => plainText(localizeField(field, context.strings).label) || field.name}
            onReorder={next => dispatch(reorderQuestions(next))}
            // eslint-disable-next-line sonarjs/cognitive-complexity
            renderRow={row => {
              const field = localizeField(row.value, context.strings);
              const original = originalByName.get(row.value.name);
              const edited = original && !isSameJson(original, row.value) ? 'edited' : undefined;
              const status = original ? edited : 'new';
              const selected = row.id === selectedId;
              const hasError = fieldIssues(row.value.name).some(issue => issue.severity === 'error');
              return (
                <div className={`webchat-question${selected ? ' selected' : ''}`}>
                  <button
                    type="button"
                    className="webchat-question-summary"
                    aria-expanded={selected}
                    onClick={() => dispatch(questionSelected(selected ? undefined : row.id))}
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
                      otherNames={fields.filter(other => other !== row.value).map(other => other.name)}
                      staffMode={staffMode}
                      linkedChains={findChainsThroughField(asFormItems(localized), field.name)}
                      labelOf={name => plainText(localizedByName.get(name)?.label) || name}
                      references={
                        original
                          ? findWebchatFieldReferences(draftFiles, field.name, settings?.contactIdentifierField)
                          : []
                      }
                      issues={fieldIssues(row.value.name)}
                      textIsShared={
                        locales.length > 1 && (!context.canTranslate || !context.knownKeys.has(String(row.value.label)))
                      }
                      prepopulate={{
                        ...getPrepopulateTargets(draftFiles, row.value.name),
                        candidates: prepopulateCandidates,
                        inUse: usesPrepopulateMappings,
                        unmatchedAnswers: target => findUnmatchedAnswers(draftFiles, row.value, target),
                      }}
                      onChangeTargets={targets => dispatch(setQuestionTargets(row.value.name, targets))}
                      onChange={edited => dispatch(updateQuestion(row.id, edited))}
                      onChangeType={type => dispatch(changeQuestionType(row.id, field, type))}
                      onEditLinked={names => dispatch(openChainEditor(names))}
                      onRemove={() => dispatch(removeQuestion(row.id))}
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
                <button type="button" className="link-button" onClick={() => dispatch(addingSet(false))}>
                  Cancel
                </button>
              </div>
              <ul>
                {ADDABLE_WEBCHAT_FIELD_TYPES.map(type => (
                  <li key={type}>
                    <button type="button" className="field-type-option" onClick={() => dispatch(addQuestion(type))}>
                      <span className="field-type-name">{WEBCHAT_FIELD_TYPE_INFO[type].label}</span>
                      <span className="muted">{WEBCHAT_FIELD_TYPE_INFO[type].description}</span>
                    </button>
                  </li>
                ))}
                <li className="field-type-wide">
                  <button type="button" className="field-type-option" onClick={() => dispatch(wizardOpened())}>
                    <span className="field-type-name">Linked dropdowns</span>
                    <span className="muted">
                      Two or more dropdowns where each one&apos;s answers depend on the one above, like province →
                      district
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <button type="button" className="add-field-button" onClick={() => dispatch(addingSet(true))}>
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
          <WebchatPreview form={preview} strings={context.strings} />
        </div>
        <p className="field-hint">
          Fill it in to try it: required questions and answers work as they will for visitors.
        </p>
      </aside>

      {wizardOpen && (
        <LinkedDropdownsWizard
          formItems={asFormItems(localized)}
          referenceData={{}}
          onCreate={(levelLabels, roots, existingTop) => dispatch(createChain(levelLabels, roots, existingTop))}
          onCancel={() => dispatch(wizardClosed())}
        />
      )}

      {editingChain && (
        <LinkedAnswersEditor
          title={`Answers for ${editingChain.fields.map(field => plainText(field.label) || field.name).join(' → ')}`}
          levelLabels={editingChain.fields.map(field => plainText(field.label) || field.name)}
          initialRoots={editingChain.tree.roots}
          notes={editingChain.notes}
          saveLabel="Save answers"
          downloadName={`webchat-${editingChain.fields.map(field => field.name).join('-')}.xlsx`}
          onSave={(roots, options) => dispatch(saveChainAnswers(roots, options))}
          onCancel={() => dispatch(chainClosed())}
        />
      )}
    </div>
  );
};
