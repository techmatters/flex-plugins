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
 * The user's draft of a helpline's definition files, kept on the server (server/api.ts):
 * locally in form-builder/drafts, deployed in a private S3 bucket. Changes are saved a moment
 * after each edit, one save at a time.
 *
 * - A saved change is only restored if the file it was based on hasn't changed since (e.g. a
 *   PR was merged meanwhile); otherwise it's dropped and the user is told.
 * - If someone else saved the draft in between, saving stops and the user is asked to reload,
 *   rather than either person silently overwriting the other.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ApplyResult } from '../server/api';
import type { DraftMeta } from '../server/drafts';
import type { DefinitionFileMap } from './definitions';
import { getChangedFilePaths } from './changes';
import type { DraftClient } from './draftClient';

export type SaveState = 'loading' | 'saved' | 'pending' | 'saving' | 'conflict' | 'error';

// Small non-cryptographic hash, only used to tell whether a file changed underneath a draft
export const hashJson = (value: unknown) => {
  const text = JSON.stringify(value) ?? '';
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 33) ^ text.charCodeAt(i);
  return (hash >>> 0).toString(16);
};

const changedFiles = (original: DefinitionFileMap, files: DefinitionFileMap) =>
  Object.fromEntries(getChangedFilePaths(original, files).map((filePath) => [filePath, files[filePath]]));

type Options = { saveDelayMs?: number };

/**
 * Use with a `key` of code/version on the owning component, so switching helpline starts
 * a fresh draft.
 */
export const useDraft = (
  code: string,
  version: string,
  original: DefinitionFileMap,
  client: DraftClient,
  { saveDelayMs = 800 }: Options = {},
) => {
  const [files, setFiles] = useState<DefinitionFileMap>(original);
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [meta, setMeta] = useState<Partial<DraftMeta>>();
  const [notice, setNotice] = useState<string>();
  const [conflict, setConflict] = useState<{ updatedBy?: string; updatedAt?: string }>();

  const filesRef = useRef(files);
  filesRef.current = files;
  const revision = useRef(0);
  // What was last saved, so unchanged drafts aren't saved again
  const lastSavedJson = useRef('{}');
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  const changedPaths = useMemo(() => getChangedFilePaths(original, files), [original, files]);
  const changedJson = useMemo(
    () => JSON.stringify(changedFiles(original, files)),
    [original, files],
  );

  // Load the saved draft, if there is one
  useEffect(() => {
    let current = true;
    client
      .load(code, version)
      .then((draft) => {
        if (!current) return;
        if (draft) {
          const restored = { ...original };
          const outdated: string[] = [];
          Object.entries(draft.files).forEach(([filePath, value]) => {
            const baseHash = draft.meta.baseHashes[filePath];
            if (!baseHash || baseHash === hashJson(original[filePath])) restored[filePath] = value;
            else outdated.push(filePath);
          });
          revision.current = draft.meta.revision;
          lastSavedJson.current = JSON.stringify(changedFiles(original, restored));
          setMeta(draft.meta);
          setFiles(restored);
          if (outdated.length > 0) {
            setNotice(
              `Some saved changes were dropped because these files changed since the draft was started: ${outdated.join(', ')}.`,
            );
          }
        }
        setSaveState('saved');
      })
      .catch((err: Error) => {
        if (!current) return;
        setSaveState('error');
        setNotice(`Couldn't load the saved draft: ${err.message}`);
      });
    return () => {
      current = false;
    };
    // Loaded once per helpline; the owning component is keyed by code/version
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNow = async () => {
    const changed = changedFiles(original, filesRef.current);
    const json = JSON.stringify(changed);
    if (json === lastSavedJson.current) {
      setSaveState('saved');
      return;
    }
    setSaveState('saving');
    try {
      const outcome = await client.save(code, version, {
        expectedRevision: revision.current,
        files: changed,
        baseHashes: Object.fromEntries(
          Object.keys(changed).map((filePath) => [filePath, hashJson(original[filePath])]),
        ),
      });
      if (!outcome.ok) {
        setConflict(outcome.conflict);
        setSaveState('conflict');
        return;
      }
      revision.current = outcome.meta.revision;
      lastSavedJson.current = json;
      setMeta(outcome.meta.revision === 0 ? undefined : (previous) => ({ ...previous, ...outcome.meta }));
      setSaveState(JSON.stringify(changedFiles(original, filesRef.current)) === json ? 'saved' : 'pending');
    } catch (err) {
      setSaveState('error');
      setNotice(`Couldn't save the draft: ${(err as Error).message}`);
    }
  };

  // Saves run one after another, so each uses the revision the previous one returned
  const flush = () => {
    saveChain.current = saveChain.current.then(saveNow);
    return saveChain.current;
  };

  // Save a moment after the last edit
  useEffect(() => {
    if (saveState === 'loading' || conflict) return undefined;
    if (changedJson === lastSavedJson.current) return undefined;
    setSaveState('pending');
    const timer = setTimeout(flush, saveDelayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedJson, conflict]);

  const updateFiles = (updater: (current: DefinitionFileMap) => DefinitionFileMap) =>
    setFiles(updater);

  const discardChanges = async () => {
    await saveChain.current;
    await client.discard(code, version);
    revision.current = 0;
    lastSavedJson.current = '{}';
    setMeta(undefined);
    setNotice(undefined);
    setFiles(original);
    setSaveState('saved');
  };

  const submit = async () => {
    await flush();
    const submitted = await client.submit(code, version);
    setMeta(submitted);
  };

  const apply = async (): Promise<ApplyResult> => {
    await flush();
    return client.apply(code, version);
  };

  return {
    files,
    changedPaths,
    saveState,
    meta,
    conflict,
    notice,
    dismissNotice: () => setNotice(undefined),
    updateFiles,
    discardChanges,
    submit,
    apply,
  };
};
