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
 * Reading and writing spreadsheets for linked dropdown answers.
 *
 * Cells copied from Excel or Google Sheets paste as tab-separated text, and CSV is parsed
 * here, so neither needs a library. Excel files use SheetJS, loaded only when needed.
 */

/**
 * Parses pasted cells (tab-separated) or CSV text into rows of cells.
 * Handles quoted CSV cells, including commas, quotes ("") and line breaks inside quotes.
 */
export const parseDelimitedText = (text: string): string[][] => {
  const normalized = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const firstLine = normalized.split('\n', 1)[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    if (inQuotes) {
      if (char === '"' && normalized[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === '') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

const EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.xlsm', '.ods'];

export const SPREADSHEET_FILE_TYPES = ['.csv', '.tsv', '.txt', ...EXCEL_EXTENSIONS].join(',');

// Reads the first sheet of an Excel file, or the text of a CSV/TSV file
export const readSpreadsheetFile = async (file: File): Promise<string[][]> => {
  const lowerName = file.name.toLowerCase();
  if (!EXCEL_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
    return parseDelimitedText(await file.text());
  }
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '' });
  return rows.map((row) => row.map((cell) => String(cell ?? '')));
};

export const downloadExcel = async (header: string[], rows: string[][], fileName: string) => {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Answers');
  XLSX.writeFile(workbook, fileName);
};
