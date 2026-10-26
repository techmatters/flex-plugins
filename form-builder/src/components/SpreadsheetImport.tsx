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
 * Replaces all the answers of a linked dropdown with rows from a spreadsheet: pasted cells,
 * a CSV file or an Excel file. Shows a preview and a summary before anything changes.
 */
import { useMemo, useState } from 'react';
import {
  AnswerNode,
  countByLevel,
  makeKeyValuesUnique,
  rowsToTree,
} from '../linkedDropdowns';
import { parseDelimitedText, readSpreadsheetFile, SPREADSHEET_FILE_TYPES } from '../spreadsheet';

type Props = {
  levelLabels: string[];
  currentRoots: AnswerNode[];
  onImport: (roots: AnswerNode[]) => void;
  onCancel: () => void;
};

const PREVIEW_ROWS = 6;

// A first row that repeats the level names is treated as column headings
const looksLikeHeader = (row: string[] | undefined, levelLabels: string[]) =>
  Boolean(
    row &&
      levelLabels.some((label, index) =>
        String(row[index] ?? '')
          .trim()
          .toLowerCase()
          .includes(label.trim().toLowerCase().split(' ')[0]),
      ),
  );

export const SpreadsheetImport = ({ levelLabels, currentRoots, onImport, onCancel }: Props) => {
  const [pastedText, setPastedText] = useState('');
  const [rows, setRows] = useState<string[][]>();
  const [source, setSource] = useState<string>();
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true);
  const [error, setError] = useState<string>();
  const depth = levelLabels.length;

  const acceptRows = (newRows: string[][], from: string) => {
    setRows(newRows);
    setSource(from);
    setFirstRowIsHeader(looksLikeHeader(newRows[0], levelLabels));
    setError(undefined);
  };

  const readFile = async (file: File) => {
    try {
      acceptRows(await readSpreadsheetFile(file), file.name);
    } catch (err) {
      setError(`Couldn't read ${file.name}: ${(err as Error).message}`);
    }
  };

  const dataRows = useMemo(
    () => (rows ? (firstRowIsHeader ? rows.slice(1) : rows) : []),
    [rows, firstRowIsHeader],
  );

  const result = useMemo(() => {
    if (!dataRows.length) return undefined;
    const { roots, stats } = rowsToTree(dataRows, depth, currentRoots);
    const unique = makeKeyValuesUnique(roots, depth, { fixExisting: true });
    return { roots, stats, counts: countByLevel(roots, depth), renamed: unique.renamed };
  }, [dataRows, depth, currentRoots]);

  const columnCount = Math.max(0, ...dataRows.map((row) => row.length));

  const confirmImport = () => {
    if (!result) return;
    const current = countByLevel(currentRoots, depth).reduce((a, b) => a + b, 0);
    if (
      current > 0 &&
      !window.confirm(
        `Replace all ${current.toLocaleString()} current answers with the ones from ${source}?`,
      )
    ) {
      return;
    }
    onImport(result.roots);
  };

  return (
    <div className="spreadsheet-import">
      {!rows ? (
        <>
          <p>
            Put one row per complete answer, with one column per level, in this order:{' '}
            <strong>{levelLabels.join(' → ')}</strong>.
          </p>
          <table className="import-example">
            <thead>
              <tr>
                {levelLabels.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {levelLabels.map((label, index) => (
                  <td key={label}>{index === 0 ? 'First answer' : `An answer under it`}</td>
                ))}
              </tr>
            </tbody>
          </table>

          <label className="field">
            <span className="field-label">Copy the cells in Excel or Google Sheets and paste them here</span>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={levelLabels.join('\t')}
            />
          </label>
          <div className="option-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={!pastedText.trim()}
              onClick={() => acceptRows(parseDelimitedText(pastedText), 'the pasted cells')}
            >
              Use pasted cells
            </button>
            <span className="muted">or</span>
            <label className="secondary-button file-button">
              Upload a file (.xlsx, .csv)
              <input
                type="file"
                accept={SPREADSHEET_FILE_TYPES}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file);
                }}
              />
            </label>
          </div>
        </>
      ) : (
        <>
          <p>
            Read <strong>{rows.length.toLocaleString()}</strong> rows from {source}.{' '}
            <button type="button" className="link-button" onClick={() => setRows(undefined)}>
              Use something else
            </button>
          </p>
          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={firstRowIsHeader}
              onChange={(e) => setFirstRowIsHeader(e.target.checked)}
            />
            <span>The first row has column names (don't import it)</span>
          </label>

          <div className="import-preview">
            <table>
              <thead>
                <tr>
                  {levelLabels.map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.slice(0, PREVIEW_ROWS).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {levelLabels.map((label, index) => (
                      <td key={label}>{row[index]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {dataRows.length > PREVIEW_ROWS && (
              <p className="field-hint">…and {(dataRows.length - PREVIEW_ROWS).toLocaleString()} more rows</p>
            )}
          </div>

          {columnCount < depth && (
            <p className="issue issue-warning">
              The rows have {columnCount} column(s) but there are {depth} levels, so the last
              level(s) will have no answers.
            </p>
          )}

          {result && (
            <ul className="import-summary">
              {levelLabels.map((label, index) => (
                <li key={label}>
                  <strong>{result.counts[index].toLocaleString()}</strong> {label}
                </li>
              ))}
              {result.stats.duplicateRows > 0 && (
                <li className="muted">{result.stats.duplicateRows} repeated row(s) skipped</li>
              )}
              {result.stats.emptyRows > 0 && (
                <li className="muted">{result.stats.emptyRows} empty row(s) skipped</li>
              )}
              {result.stats.rowsWithGaps > 0 && (
                <li className="issue issue-warning">
                  {result.stats.rowsWithGaps} row(s) skipped because a level in the middle was
                  empty
                </li>
              )}
              {result.stats.extraColumns && (
                <li className="muted">Columns after the {depth} level(s) were ignored</li>
              )}
              {result.renamed > 0 && (
                <li className="muted">
                  {result.renamed} answers share a name with another under a different parent.
                  They'll be saved with the parent added (e.g. “San Jose (Batangas)”) so each one
                  keeps its own list. Counselors still see just the name.
                </li>
              )}
            </ul>
          )}

          <div className="option-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!result}
              onClick={confirmImport}
            >
              Replace all answers with these
            </button>
            <button type="button" className="link-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </>
      )}
      {error && <p className="issue issue-error">{error}</p>}
      {!rows && (
        <button type="button" className="link-button" onClick={onCancel}>
          Back to the answers
        </button>
      )}
    </div>
  );
};
