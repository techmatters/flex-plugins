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
 * The comments on one section of a draft: what the reviewer wants changed, answers, and who each
 * is for (picked from the helpline's people list and the Aselo team's, as the flow designer's
 * tasks are). Saved on the server straight away; resolved ones are folded away.
 */
import { useState } from 'react';
import { Check, Trash2, Undo2 } from 'lucide-react';
import type { SectionComment } from '../../server/drafts';
import type { CommentChange } from '../draftClient';
import type { Person } from '../flows/model';
import { AutoTextarea } from './AutoTextarea';

const personKey = (person: Person) => person.email ?? person.name;
const personLabel = (person: Person) =>
  person.email ? `${person.name} (${person.email})` : person.name;

const when = (at: string) =>
  new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

type Props = {
  section: string;
  // All the draft's comments; only this section's are shown
  comments: SectionComment[];
  people: Person[];
  userName: string;
  isAseloStaff: boolean;
  // Open the comment box even with no comments yet (e.g. the section was just marked as needing changes)
  expanded?: boolean;
  onChange: (change: CommentChange) => Promise<void>;
};

export const SectionComments = ({
  section,
  comments,
  people,
  userName,
  isAseloStaff,
  expanded = false,
  onChange,
}: Props) => {
  const [text, setText] = useState('');
  const [assigneeKey, setAssigneeKey] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  // A section with no comments only shows a link, so the editor isn't pushed down
  const [adding, setAdding] = useState(false);

  const mine = comments.filter((comment) => comment.section === section);
  const resolved = mine.filter((comment) => comment.resolved);
  const shown = mine.filter((comment) => !comment.resolved || showResolved);

  const run = async (change: CommentChange) => {
    setBusy(true);
    setError(undefined);
    try {
      await onChange(change);
      return true;
    } catch (err) {
      setError(`Couldn't save the comment: ${(err as Error).message}`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const assignee = people.find((person) => personKey(person) === assigneeKey);
    const added = await run({
      action: 'add',
      section,
      text: text.trim(),
      ...(assignee
        ? { assignee: assignee.name, ...(assignee.email ? { assigneeEmail: assignee.email } : {}) }
        : {}),
    });
    if (added) {
      setText('');
      setAssigneeKey('');
    }
  };

  if (mine.length === 0 && !adding && !expanded) {
    return (
      <div className="section-comments-empty">
        <button type="button" className="link-button" onClick={() => setAdding(true)}>
          + Add a comment
        </button>
      </div>
    );
  }

  return (
    <section className="section-comments" aria-label="Comments on this section">
      <h3>
        Comments{mine.length - resolved.length > 0 ? ` (${mine.length - resolved.length})` : ''}
      </h3>
      {shown.length > 0 && (
        <ul>
          {shown.map((comment) => (
            <li key={comment.id} className={comment.resolved ? 'resolved' : ''}>
              <div className="section-comment-head">
                <strong>{comment.author}</strong>
                <span className="muted">{when(comment.at)}</span>
                {comment.assignee && (
                  <span className="section-comment-for">For {comment.assignee}</span>
                )}
                {comment.resolved && <span className="muted">Resolved</span>}
                <span className="section-comment-actions">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={comment.resolved ? 'Reopen' : 'Resolve'}
                    title={comment.resolved ? 'Reopen' : 'Resolve'}
                    disabled={busy}
                    onClick={() =>
                      run({ action: 'resolve', id: comment.id, resolved: !comment.resolved })
                    }
                  >
                    {comment.resolved ? <Undo2 size={13} /> : <Check size={13} />}
                  </button>
                  {(isAseloStaff || comment.author === userName) && (
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Delete comment"
                      title="Delete"
                      disabled={busy}
                      onClick={() => run({ action: 'delete', id: comment.id })}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </span>
              </div>
              <p>{comment.text}</p>
            </li>
          ))}
        </ul>
      )}
      {resolved.length > 0 && (
        <button
          type="button"
          className="link-button"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? 'Hide resolved' : `Show ${resolved.length} resolved`}
        </button>
      )}
      <form
        className="section-comment-add"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) add();
        }}
      >
        <AutoTextarea
          value={text}
          placeholder="What needs to change, or a question…"
          aria-label="New comment"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
              e.currentTarget.form?.requestSubmit();
          }}
        />
        <label className="section-comment-assignee">
          <span>For</span>
          <select value={assigneeKey} onChange={(e) => setAssigneeKey(e.target.value)}>
            <option value="">No one in particular</option>
            {people.map((person) => (
              <option key={personKey(person)} value={personKey(person)}>
                {personLabel(person)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="secondary-button" disabled={busy || !text.trim()}>
          Comment
        </button>
      </form>
      {error && <p className="issue issue-error">{error}</p>}
    </section>
  );
};
