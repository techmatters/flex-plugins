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
 * Adds a set of linked dropdowns in two steps: name the levels, then fill in the answers.
 * The first level can be a new question or one already on the form (follow-up questions).
 */
import { useState } from 'react';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { AnswerNode, chainToTree } from '../linkedDropdowns';
import { LinkedAnswersEditor } from './LinkedAnswersEditor';

const MIN_LEVELS = 2;
const MAX_LEVELS = 5;

type Props = {
  formItems: FormItemJsonDefinition[];
  referenceData: Record<string, unknown>;
  onCreate: (levelLabels: string[], roots: AnswerNode[], existingRoot?: FormItemJsonDefinition) => void;
  onCancel: () => void;
};

const ordinal = (index: number) => ['First', 'Second', 'Third', 'Fourth', 'Fifth'][index] ?? `#${index + 1}`;

export const LinkedDropdownsWizard = ({ formItems, referenceData, onCreate, onCancel }: Props) => {
  // Dropdowns already on the form that can start a chain (their answers are edited here too)
  const startCandidates = formItems.filter((item) => item.type === 'select');
  const [startFrom, setStartFrom] = useState<'new' | 'existing'>('new');
  const [rootName, setRootName] = useState(startCandidates[0]?.name ?? '');
  const [labels, setLabels] = useState(['', '']);
  const [step, setStep] = useState<'levels' | 'answers'>('levels');
  const [roots, setRoots] = useState<AnswerNode[]>([]);

  const existingRoot =
    startFrom === 'existing' ? startCandidates.find((item) => item.name === rootName) : undefined;
  const levelLabels = existingRoot ? [existingRoot.label || existingRoot.name, ...labels.slice(1)] : labels;
  const canContinue = levelLabels.every((label) => label.trim());

  const setLabel = (index: number, value: string) =>
    setLabels(labels.map((label, i) => (i === index ? value : label)));

  const goToAnswers = () => {
    // Starting from an existing dropdown: its answers become the first column
    if (existingRoot && roots.length === 0) {
      setRoots(chainToTree([existingRoot], referenceData).roots);
    }
    setStep('answers');
  };

  if (step === 'answers') {
    return (
      <LinkedAnswersEditor
        title={`Answers for ${levelLabels.join(' → ')}`}
        levelLabels={levelLabels}
        initialRoots={roots}
        saveLabel="Add these dropdowns"
        downloadName="linked-dropdowns.xlsx"
        onSave={(savedRoots) => onCreate(levelLabels, savedRoots, existingRoot)}
        onBack={(enteredRoots) => {
          setRoots(enteredRoots);
          setStep('levels');
        }}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <div className="modal-header">
          <h2 id="wizard-title">Add linked dropdowns</h2>
          <button type="button" className="link-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="muted">
          Linked dropdowns show different answers depending on what was picked in the one above.
          For example <em>Province</em>, then <em>Municipality</em>, then <em>District</em>; or a
          follow-up like <em>Experiencing abuse?</em> then <em>Risk assessment</em>.
        </p>

        <fieldset className="field wizard-start">
          <span className="field-label">What does the first dropdown ask?</span>
          <label className="field-checkbox">
            <input
              type="radio"
              name="startFrom"
              checked={startFrom === 'new'}
              onChange={() => {
                setStartFrom('new');
                setRoots([]);
              }}
            />
            <span>A new question</span>
          </label>
          <label className="field-checkbox">
            <input
              type="radio"
              name="startFrom"
              checked={startFrom === 'existing'}
              disabled={startCandidates.length === 0}
              onChange={() => {
                setStartFrom('existing');
                setRoots([]);
              }}
            />
            <span>A dropdown that's already on this form</span>
          </label>
        </fieldset>

        <ol className="wizard-levels">
          {levelLabels.map((label, index) => (
            <li key={index}>
              <label className="field">
                <span className="field-label">{ordinal(index)} dropdown</span>
                {index === 0 && startFrom === 'existing' ? (
                  <select
                    value={rootName}
                    onChange={(e) => {
                      setRootName(e.target.value);
                      setRoots([]);
                    }}
                  >
                    {startCandidates.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.label || item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={label}
                    placeholder={['e.g. Province', 'e.g. Municipality', 'e.g. District'][index] ?? ''}
                    onChange={(e) => setLabel(index, e.target.value)}
                  />
                )}
              </label>
              {labels.length > MIN_LEVELS && index === labels.length - 1 && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setLabels(labels.slice(0, -1))}
                >
                  Remove this level
                </button>
              )}
            </li>
          ))}
        </ol>
        {labels.length < MAX_LEVELS && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => setLabels([...labels, ''])}
          >
            + Add another level
          </button>
        )}

        <div className="modal-footer">
          <p className="muted">Next you'll fill in the answers, by hand or from a spreadsheet.</p>
          <button
            type="button"
            className="primary-button"
            disabled={!canContinue}
            onClick={goToAnswers}
          >
            Next: answers
          </button>
        </div>
      </div>
    </div>
  );
};
