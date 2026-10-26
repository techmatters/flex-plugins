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
 * Holds the user's draft of a helpline's definition files and keeps it in this browser's
 * local storage, so closing the tab doesn't lose work.
 *
 * This is a stopgap: drafts move to the backend (shared, survives a new browser) in Phase 4.
 * A saved change is only restored if the file it was based on hasn't changed since; otherwise
 * it's dropped and the user is told, rather than silently overwriting newer forms.
 */
import { useEffect, useMemo, useState } from 'react';
import type { DefinitionFileMap } from './definitions';
import { getChangedFilePaths } from './changes';

type StoredDraft = {
  savedAt: string;
  files: Record<string, { baseHash: string; value: unknown }>;
};

type RestoreResult = {
  files: DefinitionFileMap;
  notice?: string;
};

// Small non-cryptographic hash, only used to tell whether a file changed underneath a draft
const hashJson = (value: unknown) => {
  const text = JSON.stringify(value) ?? '';
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 33) ^ text.charCodeAt(i);
  return (hash >>> 0).toString(16);
};

const storageKey = (code: string, version: string) => `form-builder:draft:${code}:${version}`;

const restoreDraft = (code: string, version: string, original: DefinitionFileMap): RestoreResult => {
  try {
    const stored = window.localStorage.getItem(storageKey(code, version));
    if (!stored) return { files: original };
    const draft = JSON.parse(stored) as StoredDraft;
    const files = { ...original };
    const outdated: string[] = [];
    Object.entries(draft.files).forEach(([filePath, { baseHash, value }]) => {
      if (hashJson(original[filePath]) === baseHash) files[filePath] = value;
      else outdated.push(filePath);
    });
    const savedAt = new Date(draft.savedAt).toLocaleString();
    const notice = outdated.length
      ? `Your unsaved changes from ${savedAt} were restored, except for ${outdated.join(', ')}, which changed in the meantime.`
      : `Your unsaved changes from ${savedAt} were restored.`;
    return { files, notice };
  } catch {
    return { files: original };
  }
};

const saveDraft = (
  code: string,
  version: string,
  original: DefinitionFileMap,
  files: DefinitionFileMap,
  changedPaths: string[],
) => {
  try {
    if (changedPaths.length === 0) {
      window.localStorage.removeItem(storageKey(code, version));
      return;
    }
    const draft: StoredDraft = {
      savedAt: new Date().toISOString(),
      files: Object.fromEntries(
        changedPaths.map((filePath) => [
          filePath,
          { baseHash: hashJson(original[filePath]), value: files[filePath] },
        ]),
      ),
    };
    window.localStorage.setItem(storageKey(code, version), JSON.stringify(draft));
  } catch {
    // Storage can be full or blocked (private browsing); the draft still works in memory
  }
};

/**
 * Use with a `key` of code/version on the owning component, so switching helpline starts
 * a fresh draft.
 */
export const useDraft = (code: string, version: string, original: DefinitionFileMap) => {
  const [initial] = useState(() => restoreDraft(code, version, original));
  const [files, setFiles] = useState<DefinitionFileMap>(initial.files);
  const [notice, setNotice] = useState(initial.notice);

  const changedPaths = useMemo(() => getChangedFilePaths(original, files), [original, files]);

  useEffect(() => {
    saveDraft(code, version, original, files, changedPaths);
  }, [code, version, original, files, changedPaths]);

  const updateFiles = (updater: (current: DefinitionFileMap) => DefinitionFileMap) =>
    setFiles(updater);

  const discardChanges = () => {
    setFiles(original);
    setNotice(undefined);
  };

  return {
    files,
    changedPaths,
    notice,
    dismissNotice: () => setNotice(undefined),
    updateFiles,
    discardChanges,
  };
};
