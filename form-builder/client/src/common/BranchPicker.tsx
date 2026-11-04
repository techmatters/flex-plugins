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
 * Which flex-plugins branch an import reads: empty for the default (master deployed, this checkout
 * locally), or any branch, typed with suggestions (there are hundreds). And, once imported, where
 * it was read from.
 */
import { useEffect, useId, useState } from 'react';
import { GitBranch } from 'lucide-react';
import type { BranchChoice, ImportSource } from '@tech-matters/form-builder-shared';
import './designStatus.css';

type Props = {
  load: () => Promise<BranchChoice[]>;
  value: string;
  onChange: (branch: string) => void;
};

export const BranchPicker = ({ load, value, onChange }: Props) => {
  const [choices, setChoices] = useState<BranchChoice[]>();
  const listId = useId();
  useEffect(() => {
    load()
      .then(setChoices)
      .catch(() => setChoices([]));
  }, [load]);
  const defaultLabel = choices?.find(choice => choice.value === '')?.label ?? 'master';
  const unknown = Boolean(value && choices && choices.length > 1 && !choices.some(choice => choice.value === value));
  return (
    <label className="branch-picker">
      <GitBranch size={14} aria-hidden />
      <span>Branch</span>
      <input
        type="text"
        list={listId}
        value={value}
        placeholder={defaultLabel}
        aria-label="Branch to import from"
        spellCheck={false}
        onChange={e => onChange(e.target.value.trim())}
      />
      <datalist id={listId}>
        {(choices ?? [])
          .filter(choice => choice.value !== '')
          .map(choice => (
            <option key={choice.value} value={choice.value} />
          ))}
      </datalist>
      {unknown && <span className="branch-picker-warning">No branch with that name</span>}
      {!value && <span className="field-hint">(empty: {defaultLabel})</span>}
    </label>
  );
};

// Where a branch and a commit of flex-plugins are on GitHub
const REPO_URL = 'https://github.com/techmatters/flex-plugins';
export const branchUrl = (branch: string) => `${REPO_URL}/tree/${encodeURI(branch)}`;
const commitUrl = (sha: string) => `${REPO_URL}/commit/${encodeURIComponent(sha)}`;

// A branch's name, linking to it on GitHub
export const BranchLink = ({ branch, className }: { branch: string; className?: string }) => (
  <a className={className ?? 'branch-link'} href={branchUrl(branch)} target="_blank" rel="noreferrer">
    {branch}
  </a>
);

// "Read from alejandro-c/usvc/update_1029 (3f2a9c1)", each linking to GitHub; inline in a bar, or
// a line of its own
export const ImportedFrom = ({ source, inline }: { source?: ImportSource; inline?: boolean }) => {
  if (!source) return null;
  const content = (
    <>
      <GitBranch size={13} aria-hidden /> Read from <BranchLink branch={source.branch} /> (
      <a className="branch-link" href={commitUrl(source.sha)} target="_blank" rel="noreferrer">
        {source.sha.slice(0, 7)}
      </a>
      )
    </>
  );
  return inline ? (
    <span className="branch-imported-from branch-imported-from-inline">{content}</span>
  ) : (
    <p className="branch-imported-from">{content}</p>
  );
};
