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
 * The formSelector of PrepopulateMappings.json (see formSelector.ts), edited the way it's written:
 * a selectorType, then its fields (callType and parameter.availableTabs, or the parameter list of
 * { form, input, aboutSelfValue }). Info icons explain each; the result table and the JSON show
 * what it does. Everyone sees it; Aselo staff change it.
 */
import { useState } from 'react';
import { ArrowDown, ArrowUp, Info, Plus, Trash2 } from 'lucide-react';
import type { DefinitionFileMap } from '../../definitions';
import {
  CALL_TYPE_CHILD,
  ChoiceSource,
  DEFAULT_ABOUT_SELF_VALUE,
  DEFAULT_CHOICES,
  FormSelector,
  formSelectorJson,
  formSelectorOutcomes,
  getSurveyAnswerNames,
  getWebchatQuestions,
  PRESELECTABLE_CALL_TYPES,
  readFormSelector,
  removeFormSelector,
  SELECTABLE_TABS,
  ServiceUserChoice,
  setFormSelector,
} from '../../formSelector';
import type { ValidationIssue } from '../../validation';

type Props = {
  draftFiles: DefinitionFileMap;
  staffMode: boolean;
  // The helpline's use_prepopulate_mappings flag (otherwise PrepopulateKeys.json is used)
  usePrepopulateMappings: boolean;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

type StaticSelector = Extract<FormSelector, { kind: 'static' }>;
type ChoiceSelector = Extract<FormSelector, { kind: 'choice' }>;
type SelectorType = '' | 'staticSelector' | 'serviceUserChoiceSelector';

const NEW_STATIC: StaticSelector = {
  kind: 'static',
  tabs: ['ChildInformationTab', 'CaseInformationTab'],
  callType: CALL_TYPE_CHILD,
};

// What each part means (lambdas/packages/hrm-form-definitions/src/formDefinition/formSelector)
const HELP = {
  selectorType:
    'How the contact form tabs to fill in are chosen. Not set: serviceUserChoiceSelector with [{ form: "survey", input: "aboutSelf", aboutSelfValue: "Yes" }]. An unknown type also falls back to that.',
  notSet:
    'No formSelector in the file: the default applies (the survey answer "aboutSelf" = "Yes" decides, as serviceUserChoiceSelector).',
  staticSelector:
    'staticSelector: every contact fills in the same tabs (parameter.availableTabs) and gets the same callType.',
  serviceUserChoiceSelector:
    'serviceUserChoiceSelector: an answer decides. aboutSelfValue → Case + Child tabs, "Child calling about self"; any other answer → Case + Caller tabs, "Someone calling about a child"; no answer → survey answers fill Case only, preEngagement answers Case + Child.',
  callType:
    'Preselected call type, set on every contact that has chatbot/webchat data. Not set: the call type is cleared (undefined).',
  availableTabs: 'The tabs answers are written to. Mappings to other tabs are skipped.',
  parameter: 'Checked in order; the first entry with a (non-empty) answer decides.',
  form: 'Where the answer is: survey = the chatbot (Lex slot, task attribute memory); preEngagement = the webchat pre-engagement form.',
  input: 'The answer’s name: the Lex slot name (survey) or the webchat field name (preEngagement).',
  aboutSelfValue: 'The answer meaning "about themselves" (exact, case-sensitive). Not set: "Yes".',
};

const InfoTip = ({ text }: { text: string }) => (
  <span className="form-selector-info" title={text} aria-label={text} role="img">
    <Info size={13} aria-hidden />
  </span>
);

const typeOf = (implicit: boolean, selector: FormSelector): SelectorType =>
  implicit ? '' : selector.kind === 'static' ? 'staticSelector' : 'serviceUserChoiceSelector';

export const FormSelectorEditor = ({ draftFiles, staffMode, usePrepopulateMappings, issues, onChangeFiles }: Props) => {
  const info = readFormSelector(draftFiles);
  const { selector } = info;
  const selectorType = typeOf(info.implicit, selector);
  const readOnly = !staffMode;
  // What the other type held, so switching back and forth doesn't lose it
  const [remembered, setRemembered] = useState<{ static?: StaticSelector; choice?: ChoiceSelector }>({});
  const webchatQuestions = getWebchatQuestions(draftFiles);
  const surveyNames = getSurveyAnswerNames(draftFiles);

  const write = (next: FormSelector) => onChangeFiles((files) => setFormSelector(files, next));

  const switchType = (type: SelectorType) => {
    if (type === selectorType) return;
    if (!info.implicit) setRemembered((current) => ({ ...current, [selector.kind]: selector }));
    if (type === '') onChangeFiles(removeFormSelector);
    else if (type === 'staticSelector') write(remembered.static ?? NEW_STATIC);
    else write(remembered.choice ?? { kind: 'choice', choices: DEFAULT_CHOICES });
  };

  const renderStatic = (current: StaticSelector) => (
    <>
      <div className="form-selector-row">
        <code className="form-selector-key">callType</code>
        <InfoTip text={HELP.callType} />
        <select
          value={current.callType ?? ''}
          aria-label="callType"
          disabled={readOnly}
          onChange={(e) => {
            const { callType, ...rest } = current;
            write(e.target.value ? { ...rest, callType: e.target.value } : rest);
          }}
        >
          <option value="">(not set)</option>
          {[...new Set([...PRESELECTABLE_CALL_TYPES, ...(current.callType ? [current.callType] : [])])].map(
            (callType) => (
              <option key={callType} value={callType}>
                {callType}
              </option>
            ),
          )}
        </select>
      </div>
      <div className="form-selector-row">
        <code className="form-selector-key">parameter.availableTabs</code>
        <InfoTip text={HELP.availableTabs} />
        <span className="form-selector-checks">
          {SELECTABLE_TABS.map((tab) => (
            <label key={tab} className="field-checkbox">
              <input
                type="checkbox"
                checked={current.tabs.includes(tab)}
                disabled={readOnly}
                onChange={(e) =>
                  write({
                    ...current,
                    tabs: e.target.checked ? [...current.tabs, tab] : current.tabs.filter((other) => other !== tab),
                  })
                }
              />
              <code>{tab}</code>
            </label>
          ))}
        </span>
      </div>
    </>
  );

  const renderChoices = (current: ChoiceSelector) => {
    const update = (index: number, change: Partial<ServiceUserChoice>) =>
      write({
        ...current,
        choices: current.choices.map((choice, other) => (other === index ? { ...choice, ...change } : choice)),
      });
    const move = (index: number, by: number) => {
      const choices = [...current.choices];
      const [moved] = choices.splice(index, 1);
      choices.splice(index + by, 0, moved);
      write({ ...current, choices });
    };
    return (
      <div className="form-selector-row form-selector-row-block">
        <span>
          <code className="form-selector-key">parameter</code>
          <InfoTip text={HELP.parameter} />
        </span>
        <datalist id="form-selector-survey-names">
          {surveyNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <table className="form-selector-table">
          <thead>
            <tr>
              <th>#</th>
              <th>
                <code>form</code> <InfoTip text={HELP.form} />
              </th>
              <th>
                <code>input</code> <InfoTip text={HELP.input} />
              </th>
              <th>
                <code>aboutSelfValue</code> <InfoTip text={HELP.aboutSelfValue} />
              </th>
              {!readOnly && <th aria-label="Order and remove" />}
            </tr>
          </thead>
          <tbody>
            {current.choices.map((choice, index) => {
              const question = webchatQuestions.find((candidate) => candidate.name === choice.input);
              return (
                <tr key={index}>
                  <td>{index}</td>
                  <td>
                    <select
                      value={choice.form}
                      aria-label={`form ${index}`}
                      disabled={readOnly}
                      onChange={(e) => update(index, { form: e.target.value as ChoiceSource })}
                    >
                      <option value="survey">survey</option>
                      <option value="preEngagement">preEngagement</option>
                    </select>
                  </td>
                  <td>
                    {choice.form === 'preEngagement' ? (
                      <select
                        value={choice.input}
                        aria-label={`input ${index}`}
                        disabled={readOnly}
                        onChange={(e) => update(index, { input: e.target.value })}
                      >
                        {!question && <option value={choice.input}>{choice.input || '(choose)'}</option>}
                        {webchatQuestions.map((candidate) => (
                          <option key={candidate.name} value={candidate.name}>
                            {candidate.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        list="form-selector-survey-names"
                        value={choice.input}
                        aria-label={`input ${index}`}
                        disabled={readOnly}
                        onChange={(e) => update(index, { input: e.target.value.trim() })}
                      />
                    )}
                  </td>
                  <td>
                    {question?.values && choice.form === 'preEngagement' ? (
                      <select
                        value={choice.aboutSelfValue ?? ''}
                        aria-label={`aboutSelfValue ${index}`}
                        disabled={readOnly}
                        onChange={(e) => update(index, { aboutSelfValue: e.target.value || undefined })}
                      >
                        <option value="">(not set: “{DEFAULT_ABOUT_SELF_VALUE}”)</option>
                        {question.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={`(not set: “${DEFAULT_ABOUT_SELF_VALUE}”)`}
                        value={choice.aboutSelfValue ?? ''}
                        aria-label={`aboutSelfValue ${index}`}
                        disabled={readOnly}
                        onChange={(e) => update(index, { aboutSelfValue: e.target.value || undefined })}
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td className="form-selector-actions">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Move entry ${index} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Move entry ${index} down`}
                        disabled={index === current.choices.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove entry ${index}`}
                        onClick={() =>
                          write({ ...current, choices: current.choices.filter((_, other) => other !== index) })
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!readOnly && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => write({ ...current, choices: [...current.choices, { form: 'survey', input: 'aboutSelf' }] })}
          >
            <Plus size={13} aria-hidden /> Add an entry
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>
            Filling in the contact <code className="form-selector-file">PrepopulateMappings.json › formSelector</code>
          </h2>
          {!usePrepopulateMappings && (
            <div className="alert alert-info">
              <code>use_prepopulate_mappings</code> is off: the plugin still uses PrepopulateKeys.json, so this has no
              effect yet.
            </div>
          )}
          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.map((found) => (
                <li key={found.message} className={`issue issue-${found.severity}`}>
                  {found.message}
                </li>
              ))}
            </ul>
          )}

          <div className="form-selector-row">
            <code className="form-selector-key">selectorType</code>
            <InfoTip text={HELP.selectorType} />
            <select
              value={selectorType}
              aria-label="selectorType"
              disabled={readOnly}
              onChange={(e) => switchType(e.target.value as SelectorType)}
            >
              <option value="">(not set: default)</option>
              <option value="staticSelector">staticSelector</option>
              <option value="serviceUserChoiceSelector">serviceUserChoiceSelector</option>
            </select>
            <InfoTip
              text={
                selectorType === ''
                  ? HELP.notSet
                  : selectorType === 'staticSelector'
                    ? HELP.staticSelector
                    : HELP.serviceUserChoiceSelector
              }
            />
            {info.unknownType && (
              <span className="field-hint">
                The file has “{info.unknownType}”, which Aselo doesn&apos;t know: the default applies.
              </span>
            )}
          </div>
          {selectorType === 'staticSelector' && renderStatic(selector as StaticSelector)}
          {selectorType === 'serviceUserChoiceSelector' && renderChoices(selector as ChoiceSelector)}
          {selectorType === '' && (
            <p className="field-hint form-selector-default">
              Default: <code>serviceUserChoiceSelector</code> with{' '}
              <code>{JSON.stringify(DEFAULT_CHOICES.map(({ form, input }) => ({ form, input })))}</code>
            </p>
          )}

          <h3 className="section-heading">Result</h3>
          <table className="form-selector-table form-selector-result-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Tabs filled in</th>
                <th>callType</th>
              </tr>
            </thead>
            <tbody>
              {formSelectorOutcomes(selector).map((outcome) => (
                <tr key={outcome.when}>
                  <td>
                    {outcome.when}
                    {outcome.note && <InfoTip text={outcome.note} />}
                  </td>
                  <td>
                    {outcome.tabs.length > 0
                      ? outcome.tabs.map((tab) => (
                          <code key={tab} className="form-selector-tab-key">
                            {tab}
                          </code>
                        ))
                      : '–'}
                  </td>
                  <td>{outcome.callType ? <code>{outcome.callType}</code> : '(not set)'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="section-heading">JSON</h3>
          <pre className="form-selector-json">
            {info.implicit && !info.unknownType
              ? '(not in the file)'
              : JSON.stringify({ formSelector: formSelectorJson(selector) }, null, 2)}
          </pre>
          {readOnly && <p className="muted">Aselo staff can change this.</p>}
        </section>
      </div>
    </div>
  );
};
