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
 * Comments on a chatbot, a question, a list of answers or an answer: a speech-bubble button with
 * how many are open, and the thread itself (shown under the item when opened). Open comments go in
 * the export, so Claude reads them too; resolved ones are kept but folded away.
 */
import { useState } from 'react';
import { Check, MessageCircle, Trash2, Undo2 } from 'lucide-react';
import type { DesignComment } from './model';
import { newComment, openComments } from './edit';
import { AutoTextarea } from '../components/AutoTextarea';

export const CommentsToggle = ({
  comments,
  open,
  label,
  onToggle,
}: {
  comments?: DesignComment[];
  open: boolean;
  // e.g. "Comments on question 2"
  label: string;
  onToggle: () => void;
}) => {
  const count = openComments(comments).length;
  return (
    <button
      type="button"
      className={`chatbot-comments-toggle ${count > 0 ? 'has-comments' : ''} ${open ? 'open' : ''}`}
      aria-label={`${label}${count > 0 ? ` (${count})` : ''}`}
      aria-expanded={open}
      title={count > 0 ? `${count} comment${count === 1 ? '' : 's'}` : 'Add a comment'}
      onClick={onToggle}
    >
      <MessageCircle size={14} aria-hidden />
      {count > 0 && <span>{count}</span>}
    </button>
  );
};

const when = (at: string) =>
  new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const CommentThread = ({
  comments,
  author,
  canEdit,
  placeholder = 'A comment for the team and for Claude…',
  onChange,
}: {
  comments?: DesignComment[];
  author: string;
  canEdit: boolean;
  placeholder?: string;
  onChange: (comments: DesignComment[] | undefined) => void;
}) => {
  const [text, setText] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const all = comments ?? [];
  const resolved = all.filter((comment) => comment.resolved);
  const shown = all.filter((comment) => !comment.resolved || showResolved);
  const set = (next: DesignComment[]) => onChange(next.length > 0 ? next : undefined);
  const update = (id: string, change: (comment: DesignComment) => DesignComment | undefined) =>
    set(
      all
        .map((comment) => (comment.id === id ? change(comment) : comment))
        .filter((comment): comment is DesignComment => comment !== undefined),
    );
  return (
    <div className="chatbot-thread">
      {shown.length > 0 && (
        <ul>
          {shown.map((comment) => (
            <li key={comment.id} className={comment.resolved ? 'resolved' : ''}>
              <div className="chatbot-thread-head">
                <strong>{comment.author}</strong>
                <span>{when(comment.at)}</span>
                {comment.resolved && <span className="chatbot-thread-resolved">Resolved</span>}
                {canEdit && (
                  <span className="chatbot-thread-actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={comment.resolved ? 'Reopen' : 'Resolve'}
                      title={comment.resolved ? 'Reopen' : 'Resolve'}
                      onClick={() => update(comment.id, (old) => ({ ...old, resolved: !old.resolved || undefined }))}
                    >
                      {comment.resolved ? <Undo2 size={13} /> : <Check size={13} />}
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Delete comment"
                      title="Delete"
                      onClick={() => update(comment.id, () => undefined)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                )}
              </div>
              <p>{comment.text}</p>
            </li>
          ))}
        </ul>
      )}
      {resolved.length > 0 && (
        <button
          type="button"
          className="link-button chatbot-thread-more"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? 'Hide resolved' : `Show ${resolved.length} resolved`}
        </button>
      )}
      {canEdit && (
        <form
          className="chatbot-thread-add"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            set([...all, newComment(text.trim(), author)]);
            setText('');
          }}
        >
          <AutoTextarea
            value={text}
            placeholder={placeholder}
            aria-label="New comment"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
            }}
          />
          <button type="submit" className="secondary-button" disabled={!text.trim()}>
            Comment
          </button>
        </form>
      )}
      {!canEdit && all.length === 0 && <p className="field-hint">No comments.</p>}
    </div>
  );
};
