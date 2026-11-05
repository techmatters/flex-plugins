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
 * Aselo staff only: every string counselors see in Aselo, per language, and the helpline's own
 * versions of them (customStrings/Substitutions.json). Search and filter them, change one,
 * find & replace across all of them, add a language, or hand a spreadsheet to a translator.
 * State and logic live in translationsSlice.ts.
 */
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectWorkspace } from '../workspace/workspaceSlice';
import { SectionTitle } from '../help/HelpContext';
import { AVAILABLE_LANGUAGES } from '../aseloPreview/translations';
import { TranslationFilter, TranslationRow, translationsToCsv } from './translations';
import {
  addLanguage,
  applyReplacements,
  chooseLanguage,
  dismissNotice,
  editingToggled,
  editTranslation,
  filterChanged,
  findReplaceChanged,
  importSpreadsheet,
  moreShown,
  openTranslations,
  replacementSkipped,
  searchChanged,
  selectLanguages,
  selectReplacements,
  selectTranslationRows,
  selectTranslations,
  selectVisibleTranslationRows,
} from './translationsSlice';
import './translations.css';

const FILTERS: { key: TranslationFilter; label: string }[] = [
  { key: 'all', label: 'All strings' },
  { key: 'changed', label: 'Changed for this helpline' },
  { key: 'untranslated', label: 'Still in English' },
];

// Base languages Aselo has text for (en, es, fr...), to offer when adding one
const ASELO_LANGUAGES = [...new Set(AVAILABLE_LANGUAGES.map(code => code.split('-')[0]))].sort();

const SOURCE_BADGES: Record<TranslationRow['source'], { label: string; className: string } | undefined> = {
  aselo: undefined,
  helpline: { label: 'Changed', className: 'badge badge-edited' },
  helplineOnly: { label: 'Helpline only', className: 'badge badge-new' },
};

const download = (text: string, fileName: string) => {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const TranslationRowView = ({ row, language }: { row: TranslationRow; language: string }) => {
  const dispatch = useAppDispatch();
  const { editingKey } = useAppSelector(selectTranslations);
  const isEditing = editingKey === row.key;
  const badge = SOURCE_BADGES[row.source];
  return (
    <tr className={isEditing ? 'config-row-open' : undefined}>
      <td>
        <button
          type="button"
          className="config-setting-name"
          aria-expanded={isEditing}
          onClick={() => dispatch(editingToggled(row.key))}
        >
          <code>{row.key}</code>
        </button>
        {badge && <span className={badge.className}>{badge.label}</span>}
        {row.inEnglish && <span className="badge translation-badge-english">English</span>}
      </td>
      <td>
        {isEditing ? (
          <div className="translation-edit">
            <textarea
              aria-label={`Text for ${row.key} (${language})`}
              value={row.text}
              rows={Math.min(8, Math.max(2, Math.ceil(row.text.length / 60)))}
              onChange={e => dispatch(editTranslation(row.key, e.target.value))}
            />
            {row.source !== 'helplineOnly' && (
              <p className="field-hint">
                Aselo’s text: <span className="translation-aselo-text">{row.aseloText || '(empty)'}</span>
              </p>
            )}
            <div className="translation-edit-actions">
              {row.source === 'helpline' && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => dispatch(editTranslation(row.key, undefined))}
                >
                  Use Aselo’s text again
                </button>
              )}
              {row.source === 'helplineOnly' && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => dispatch(editTranslation(row.key, undefined))}
                >
                  Remove
                </button>
              )}
              <button type="button" className="link-button" onClick={() => dispatch(editingToggled(row.key))}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <span className="translation-text">{row.text}</span>
        )}
      </td>
    </tr>
  );
};

const FindReplace = () => {
  const dispatch = useAppDispatch();
  const { findReplace } = useAppSelector(selectTranslations);
  const replacements = useAppSelector(selectReplacements);
  const chosen = replacements.filter(replacement => !findReplace.skipped.includes(replacement.key));
  return (
    <div className="translation-find-replace">
      <div className="translation-find-fields">
        <label>
          Find
          <input
            type="text"
            value={findReplace.find}
            onChange={e => dispatch(findReplaceChanged({ find: e.target.value }))}
          />
        </label>
        <label>
          Replace with
          <input
            type="text"
            value={findReplace.replace}
            onChange={e => dispatch(findReplaceChanged({ replace: e.target.value }))}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={findReplace.wholeWord}
            onChange={e => dispatch(findReplaceChanged({ wholeWord: e.target.checked }))}
          />
          Whole words
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={findReplace.matchCase}
            onChange={e => dispatch(findReplaceChanged({ matchCase: e.target.checked }))}
          />
          Match case
        </label>
      </div>
      {findReplace.find && (
        <>
          <p className="muted">
            {replacements.length === 0
              ? 'Not found in any string.'
              : `Found in ${replacements.length} string${
                  replacements.length === 1 ? '' : 's'
                }. Untick the ones to leave as they are.`}
            {!findReplace.matchCase &&
              replacements.length > 0 &&
              ' Capitals follow each match (Child → Help seeker, child → help seeker).'}
          </p>
          {replacements.length > 0 && (
            <ul className="translation-replacements">
              {replacements.map(replacement => (
                <li key={replacement.key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!findReplace.skipped.includes(replacement.key)}
                      onChange={() => dispatch(replacementSkipped(replacement.key))}
                    />
                    <code>{replacement.key}</code>
                  </label>
                  <div className="translation-replacement-texts">
                    <span className="translation-before">{replacement.before}</span>
                    <span className="translation-after">{replacement.after}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="primary-button"
            disabled={chosen.length === 0}
            onClick={() => dispatch(applyReplacements())}
          >
            Replace in {chosen.length} string{chosen.length === 1 ? '' : 's'}
          </button>
        </>
      )}
    </div>
  );
};

export const TranslationsEditor = () => {
  const dispatch = useAppDispatch();
  const { code, editorRevision } = useAppSelector(selectWorkspace);
  const { language, aselo, search, filter, shown, findReplace, notice } = useAppSelector(selectTranslations);
  const languages = useAppSelector(selectLanguages);
  const rows = useAppSelector(selectTranslationRows);
  const visible = useAppSelector(selectVisibleTranslationRows);
  // What's being typed in "Add a language", until it's added
  const [newLanguage, setNewLanguage] = useState('');

  // Afresh when it opens, and when the draft's files are replaced
  useEffect(() => {
    dispatch(openTranslations());
  }, [dispatch, editorRevision]);

  const readSpreadsheet = async (file: File | undefined) => {
    if (file) dispatch(importSpreadsheet(await file.text()));
  };

  return (
    <section className="panel translations-panel">
      <SectionTitle>Translations</SectionTitle>
      <p className="muted">
        Every string counselors see in Aselo, and this helpline’s own versions of them
        (customStrings/Substitutions.json). A changed string replaces Aselo’s whole string for this helpline, and stops
        following Aselo’s text when that changes. Field labels, answers and categories are looked up by their own text,
        so they can be translated here too with “Add a string”.
      </p>

      <div className="translation-languages">
        <div className="mode-switch" role="group" aria-label="Language">
          {languages.map(candidate => (
            <button
              key={candidate}
              type="button"
              className={candidate === language ? 'active' : ''}
              onClick={() => dispatch(chooseLanguage(candidate))}
            >
              {candidate}
            </button>
          ))}
        </div>
        <form
          className="translation-add-language"
          onSubmit={e => {
            e.preventDefault();
            dispatch(addLanguage(newLanguage));
            setNewLanguage('');
          }}
        >
          <input
            type="text"
            list="aselo-languages"
            aria-label="Add a language"
            placeholder="Add a language (e.g. es)"
            value={newLanguage}
            onChange={e => setNewLanguage(e.target.value)}
          />
          <datalist id="aselo-languages">
            {ASELO_LANGUAGES.filter(candidate => !languages.includes(candidate)).map(candidate => (
              <option key={candidate} value={candidate} />
            ))}
          </datalist>
          <button type="submit" className="secondary-button" disabled={!newLanguage.trim()}>
            Add
          </button>
        </form>
      </div>
      {aselo && language !== 'en' && !ASELO_LANGUAGES.includes(language) && (
        <p className="alert alert-info">
          Aselo has no text of its own in “{language}”: counselors see English for every string not translated here.
        </p>
      )}

      <div className="config-toolbar">
        <input
          type="search"
          aria-label="Search strings"
          placeholder="Search keys and text"
          value={search}
          onChange={e => dispatch(searchChanged(e.target.value))}
        />
        <select
          aria-label="Which strings"
          value={filter}
          onChange={e => dispatch(filterChanged(e.target.value as TranslationFilter))}
        >
          {FILTERS.filter(item => item.key !== 'untranslated' || language !== 'en').map(item => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="muted">
          {visible.length} of {rows.length} strings
        </span>
        <span className="translation-toolbar-actions">
          <button
            type="button"
            className="secondary-button"
            aria-expanded={findReplace.open}
            onClick={() => dispatch(findReplaceChanged({ open: !findReplace.open }))}
          >
            Find &amp; replace
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={rows.length === 0}
            onClick={() => download(translationsToCsv(rows), `${code}-translations-${language}.csv`)}
          >
            Export spreadsheet
          </button>
          <label className="secondary-button translation-import">
            Import spreadsheet
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              className="visually-hidden"
              onChange={e => {
                readSpreadsheet(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        </span>
      </div>

      {notice && (
        <div className={notice.kind === 'error' ? 'alert alert-error' : 'alert alert-info'}>
          {notice.text}{' '}
          <button type="button" className="link-button" onClick={() => dispatch(dismissNotice())}>
            Dismiss
          </button>
        </div>
      )}

      {findReplace.open && <FindReplace />}

      {aselo ? (
        <>
          <table className="config-table translations-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Text counselors see ({language})</th>
              </tr>
            </thead>
            <tbody>
              {visible.slice(0, shown).map(row => (
                <TranslationRowView key={row.key} row={row} language={language} />
              ))}
            </tbody>
          </table>
          {visible.length > shown && (
            <button type="button" className="secondary-button translation-more" onClick={() => dispatch(moreShown())}>
              Show more ({visible.length - shown} left)
            </button>
          )}
        </>
      ) : (
        <p className="muted">Loading Aselo’s text…</p>
      )}

      <AddString />
    </section>
  );
};

// A string Aselo doesn't have, e.g. a field label in another language: its key is the label's text
const AddString = () => {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(selectTranslations);
  const rows = useAppSelector(selectTranslationRows);
  // Typed until it's added
  const [key, setKey] = useState('');
  const [text, setText] = useState('');
  const exists = rows.some(row => row.key === key.trim());
  return (
    <form
      className="translation-add-string"
      onSubmit={e => {
        e.preventDefault();
        dispatch(editTranslation(key.trim(), text));
        dispatch(searchChanged(key.trim()));
        setKey('');
        setText('');
      }}
    >
      <h3>Add a string</h3>
      <p className="field-hint">
        For text Aselo looks up by itself, e.g. a field label, an answer or a category: the key is the text as written
        in the form, and the text is what counselors see in {language}.
      </p>
      <input
        type="text"
        aria-label="Key"
        placeholder="Key (e.g. Age)"
        value={key}
        onChange={e => setKey(e.target.value)}
      />
      <input
        type="text"
        aria-label="Text"
        placeholder={`Text in ${language}`}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button type="submit" className="secondary-button" disabled={!key.trim() || !text || exists}>
        Add string
      </button>
      {exists && <span className="field-hint">It’s in the list already: search for it to change it.</span>}
    </form>
  );
};
