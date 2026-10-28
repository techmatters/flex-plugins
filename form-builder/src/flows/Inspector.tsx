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
 * The side panel: settings of what's selected (or of the board, when nothing is).
 */
import { useState } from 'react';
import {
  Channel,
  CommentThread,
  exitsOf,
  FlowObjectType,
  FlowStage,
  OBJECT_COLORS,
  OBJECT_TYPES,
  objectColor,
  STICKY_COLORS,
  StickyColor,
  suggestStudioName,
  TASK_STATUSES,
  TaskStatus,
} from './model';
import type { BoardContent, Person } from './model';
import { CanvasNode, ConnectionEdge, FrameNode, newId, ObjectNode, StickyNode } from './canvasModel';
import type { Issue } from './checks';
import { uniqueName } from './checks';
import { RecordingActions, RecordingSection, ScriptApproval } from './RecordingControls';

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'voice', label: 'Voice' },
  { value: 'sms', label: 'SMS' },
  { value: 'webchat', label: 'Webchat' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'line', label: 'LINE' },
];

export type InspectorProps = {
  title: string;
  // The board as saved, for checks across objects (e.g. names already used)
  content: BoardContent;
  // What the check found on each object (checks.ts), by object id
  problems: Map<string, Issue[]>;
  // Who tasks can be assigned to: the helpline's people and the Aselo team
  people: Person[];
  nodes: CanvasNode[];
  edges: ConnectionEdge[];
  readOnly: boolean;
  userName: string;
  onTitleChange: (title: string) => void;
  onNodeData: (id: string, data: CanvasNode['data']) => void;
  onChangeType: (id: string, type: FlowObjectType) => void;
  onRenameExit: (id: string, exits: string[], renamed?: { from: string; to: string }) => void;
  onEdgeExit: (id: string, exit: string | undefined) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFocusFrame: (id: string) => void;
  onEndHere: (objectId: string, exit: string, ends?: boolean) => void;
  // The helpline's recordings, and what this person can do with them
  recordings: RecordingActions;
};

const ChannelSelect = ({
  value,
  disabled,
  onChange,
}: {
  value?: Channel;
  disabled: boolean;
  onChange: (channel?: Channel) => void;
}) => (
  <label className="field">
    <span className="field-label">Channel</span>
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange((e.target.value || undefined) as Channel | undefined)}
    >
      <option value="">Not set</option>
      {CHANNELS.map((channel) => (
        <option key={channel.value} value={channel.value}>
          {channel.label}
        </option>
      ))}
    </select>
  </label>
);

const Comments = ({
  thread,
  readOnly,
  userName,
  onChange,
}: {
  thread?: CommentThread;
  readOnly: boolean;
  userName: string;
  onChange: (thread: CommentThread | undefined) => void;
}) => {
  const [text, setText] = useState('');
  const comments = thread?.comments ?? [];
  const add = () => {
    if (!text.trim()) return;
    onChange({
      resolved: false,
      comments: [...comments, { id: newId('m'), author: userName, at: new Date().toISOString(), text: text.trim() }],
    });
    setText('');
  };
  return (
    <section className="flow-inspector-section">
      <h3>
        Comments
        {thread?.resolved && <span className="flow-resolved"> · resolved</span>}
      </h3>
      {comments.length === 0 && <p className="field-hint">No comments yet.</p>}
      <ul className="flow-comments">
        {comments.map((comment) => (
          <li key={comment.id}>
            <span className="flow-comment-author">{comment.author}</span>{' '}
            <span className="field-hint">{new Date(comment.at).toLocaleString()}</span>
            <p>{comment.text}</p>
          </li>
        ))}
      </ul>
      {!readOnly && (
        <>
          <textarea
            rows={2}
            value={text}
            aria-label="New comment"
            placeholder="Write a comment"
            onChange={(e) => setText(e.target.value)}
          />
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={add} disabled={!text.trim()}>
              Comment
            </button>
            {comments.length > 0 && (
              <button
                type="button"
                className="link-button"
                onClick={() => onChange({ comments, resolved: !thread?.resolved })}
              >
                {thread?.resolved ? 'Reopen' : 'Resolve'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

const ExitsEditor = ({
  exits,
  readOnly,
  onChange,
}: {
  exits: string[];
  readOnly: boolean;
  onChange: (exits: string[], renamed?: { from: string; to: string }) => void;
}) => (
  <section className="flow-inspector-section">
    <h3>Ways out</h3>
    <p className="field-hint">The answers or results this can lead to. Each connection from it is one of these.</p>
    <ul className="flow-exits">
      {exits.map((exit, index) => (
        <li key={index}>
          <input
            type="text"
            value={exit}
            aria-label="Way out"
            disabled={readOnly}
            onChange={(e) =>
              onChange(
                exits.map((candidate, i) => (i === index ? e.target.value : candidate)),
                { from: exit, to: e.target.value },
              )
            }
          />
          {!readOnly && (
            <button
              type="button"
              className="icon-button"
              aria-label="Remove way out"
              onClick={() => onChange(exits.filter((_, i) => i !== index))}
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
    {!readOnly && (
      <button
        type="button"
        className="secondary-button"
        onClick={() => onChange([...exits, `Option ${exits.length + 1}`])}
      >
        + Add a way out
      </button>
    )}
  </section>
);

const ObjectSettings = ({ node, props }: { node: ObjectNode; props: InspectorProps }) => {
  const { readOnly, onNodeData } = props;
  const { object } = node.data;
  const info = OBJECT_TYPES[object.type];
  const frame = props.nodes.find((candidate): candidate is FrameNode => candidate.id === node.parentId);
  const update = (changes: Partial<ObjectNode['data']['object']>) =>
    onNodeData(node.id, { object: { ...object, ...changes } });
  const suggested = suggestStudioName(object, frame?.data.frame);
  // Not one another object in the same flow already has
  const suggestion = suggested && uniqueName(suggested, { id: node.id, frameId: node.parentId }, props.content);
  const problems = props.problems.get(node.id) ?? [];
  const showsChannel = info.hasMessage || object.type === 'incoming';

  const exits = exitsOf(object);
  const nameOfTarget = (id: string) => {
    const target = props.nodes.find(
      (candidate): candidate is ObjectNode => candidate.id === id && candidate.type === 'object',
    );
    return target ? target.data.object.studioName || target.data.object.text : 'another object';
  };

  return (
    <>
      {problems.length > 0 && (
        <ul className="flow-problems" aria-label="Problems">
          {problems.map((issue) => (
            <li key={issue.key} className={issue.severity}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
      <section className="flow-inspector-section">
        <label className="field">
          <span className="field-label">Kind</span>
          <select
            value={object.type}
            disabled={readOnly}
            onChange={(e) => props.onChangeType(node.id, e.target.value as FlowObjectType)}
          >
            {(Object.keys(OBJECT_TYPES) as FlowObjectType[]).map((type) => (
              <option key={type} value={type}>
                {OBJECT_TYPES[type].label}
              </option>
            ))}
          </select>
          {info.studioWidget && <span className="field-hint">In Studio: {info.studioWidget}</span>}
        </label>
        <label className="field">
          <span className="field-label">Text</span>
          <textarea
            rows={2}
            value={object.text}
            disabled={readOnly}
            onChange={(e) => update({ text: e.target.value })}
          />
        </label>
        <div className="field">
          <span className="field-label">Colour</span>
          <div className="flow-swatches">
            {OBJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`flow-swatch ${objectColor(object) === color ? 'selected' : ''}`}
                style={{ background: color }}
                aria-label={`Colour ${color}`}
                disabled={readOnly}
                onClick={() => update({ color })}
              />
            ))}
            {object.color && !readOnly && (
              <button type="button" className="link-button" onClick={() => update({ color: undefined })}>
                Default
              </button>
            )}
          </div>
        </div>
      </section>

      {showsChannel && (
        <section className="flow-inspector-section">
          <h3>{object.type === 'incoming' ? 'Contact' : 'Message'}</h3>
          <ChannelSelect
            value={object.message?.channel}
            disabled={readOnly}
            onChange={(channel) => update({ message: { ...object.message, channel } })}
          />
          {info.hasMessage && (
            <>
              <label className="field">
                <span className="field-label">Language</span>
                <input
                  type="text"
                  list="flow-languages"
                  value={object.message?.language ?? ''}
                  disabled={readOnly}
                  placeholder="en"
                  onChange={(e) => update({ message: { ...object.message, language: e.target.value || undefined } })}
                />
                <datalist id="flow-languages">
                  {['en', 'es', 'fr', 'pt', 'mt', 'zh'].map((language) => (
                    <option key={language} value={language} />
                  ))}
                </datalist>
              </label>
              <label className="field">
                <span className="field-label">Script</span>
                <textarea
                  rows={5}
                  value={object.message?.script ?? ''}
                  disabled={readOnly}
                  placeholder="What the caller hears, or the message sent"
                  onChange={(e) => update({ message: { ...object.message, script: e.target.value || undefined } })}
                />
              </label>
            </>
          )}
        </section>
      )}

      {info.hasMessage && (
        <>
          <RecordingSection object={object} frame={frame?.data.frame} actions={props.recordings} />
          <ScriptApproval
            object={object}
            frame={frame?.data.frame}
            staff={props.recordings.staff}
            readOnly={readOnly}
            userName={props.userName}
            onApprove={(approved) => update({ message: { ...object.message, approved } })}
          />
        </>
      )}

      {info.studioPrefix && (
        <section className="flow-inspector-section">
          <label className="field">
            <span className="field-label">Studio name</span>
            <input
              type="text"
              value={object.studioName ?? ''}
              disabled={readOnly}
              placeholder={suggestion}
              onChange={(e) => update({ studioName: e.target.value.trim() || undefined })}
            />
            <span className="field-hint">
              The widget&apos;s name in Studio
              {info.hasMessage && object.message?.channel === 'voice' ? ' and its recording file' : ''}.
            </span>
          </label>
          {!readOnly && suggestion && suggestion !== object.studioName && (
            <button type="button" className="link-button" onClick={() => update({ studioName: suggestion })}>
              Use {suggestion}
            </button>
          )}
        </section>
      )}

      {info.fields && (
        <section className="flow-inspector-section">
          <h3>Call settings</h3>
          {info.studioRoute && (
            <p className="field-hint">
              Calls <code>{info.studioRoute}</code> (see STUDIO_ROUTES.md in the account-scoped lambdas).
            </p>
          )}
          {info.fields.map((field) => {
            const value = object.settings?.[field.key] ?? '';
            const set = (newValue: string) => {
              const { [field.key]: _removed, ...others } = object.settings ?? {};
              const settings = newValue ? { ...others, [field.key]: newValue } : others;
              update({ settings: Object.keys(settings).length > 0 ? settings : undefined });
            };
            return (
              <label key={field.key} className="field">
                <span className="field-label">{field.label}</span>
                {field.options ? (
                  <select value={value} disabled={readOnly} onChange={(e) => set(e.target.value)}>
                    <option value="">Not set</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={value}
                    placeholder={field.placeholder}
                    disabled={readOnly}
                    onChange={(e) => set(e.target.value)}
                  />
                )}
                {field.hint && <span className="field-hint">{field.hint}</span>}
              </label>
            );
          })}
        </section>
      )}

      {exits.length > 0 && (
        <section className="flow-inspector-section">
          <h3>Where it goes</h3>
          <ul className="flow-exit-targets">
            {exits.map((exit) => {
              const connection = props.edges.find(
                (edge) => edge.source === node.id && (edge.data?.exit ?? '') === exit,
              );
              const ended = (object.endedExits ?? []).includes(exit);
              return (
                <li key={exit || 'next'}>
                  <span className="flow-exit-name">{exit || 'Next'}</span>
                  {connection ? (
                    <span>→ {nameOfTarget(connection.target)}</span>
                  ) : (
                    <label className="field-checkbox">
                      <input
                        type="checkbox"
                        checked={ended}
                        disabled={readOnly}
                        onChange={(e) => props.onEndHere(node.id, exit, e.target.checked)}
                      />
                      <span>{ended ? 'The flow ends here' : 'Not connected: the flow ends here on purpose'}</span>
                    </label>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {info.editableExits && (
        <ExitsEditor
          exits={exitsOf(object)}
          readOnly={readOnly}
          onChange={(exits, renamed) => props.onRenameExit(node.id, exits, renamed)}
        />
      )}

      {object.studio && (
        <section className="flow-inspector-section">
          <h3>In Studio today</h3>
          <p className="field-hint">
            Imported from the live flow: a <code>{object.studio.type}</code> widget named{' '}
            <code>{object.studio.name}</code>.
          </p>
          {object.studio.properties && (
            <details>
              <summary>Its settings</summary>
              <pre className="flow-studio-properties">{JSON.stringify(object.studio.properties, null, 2)}</pre>
            </details>
          )}
        </section>
      )}

      <Comments
        thread={object.thread}
        readOnly={readOnly}
        userName={props.userName}
        onChange={(thread) => update({ thread })}
      />
    </>
  );
};

const FrameSettings = ({ node, props }: { node: FrameNode; props: InspectorProps }) => {
  const { frame } = node.data;
  const update = (changes: Partial<FrameNode['data']['frame']>) =>
    props.onNodeData(node.id, { frame: { ...frame, ...changes } });
  return (
    <section className="flow-inspector-section">
      <label className="field">
        <span className="field-label">Frame title</span>
        <input
          type="text"
          value={frame.title}
          disabled={props.readOnly}
          onChange={(e) => update({ title: e.target.value })}
        />
      </label>
      <p className="field-hint">When the frame is one Studio flow, say which, so the exports know.</p>
      <ChannelSelect value={frame.channel} disabled={props.readOnly} onChange={(channel) => update({ channel })} />
      <label className="field">
        <span className="field-label">Part of the flow</span>
        <select
          value={frame.stage ?? ''}
          disabled={props.readOnly}
          onChange={(e) => update({ stage: (e.target.value || undefined) as FlowStage | undefined })}
        >
          <option value="">Not set</option>
          <option value="prequeue">Before the queue (pre-queue)</option>
          <option value="postqueue">While waiting in the queue (post-queue)</option>
        </select>
      </label>
      <button type="button" className="link-button" onClick={() => props.onFocusFrame(node.id)}>
        Zoom to this frame
      </button>
    </section>
  );
};

const personKey = (person: Person) => person.email ?? person.name;
const personLabel = (person: Person) => (person.email ? `${person.name} (${person.email})` : person.name);

const StickySettings = ({ node, props }: { node: StickyNode; props: InspectorProps }) => {
  const { sticky } = node.data;
  const { task } = sticky;
  const update = (changes: Partial<StickyNode['data']['sticky']>) =>
    props.onNodeData(node.id, { sticky: { ...sticky, ...changes } });
  const updateTask = (changes: Partial<NonNullable<typeof task>>) =>
    update({ task: { status: 'todo', ...task, ...changes } });
  // The people lists, plus whoever the task is for if they've left them since
  const assignee: Person | undefined = task?.assignee
    ? { name: task.assignee, ...(task.assigneeEmail ? { email: task.assigneeEmail } : {}) }
    : undefined;
  const choices =
    assignee && !props.people.some((person) => personKey(person) === personKey(assignee))
      ? [...props.people, assignee]
      : props.people;
  return (
    <>
      <section className="flow-inspector-section">
        <label className="field">
          <span className="field-label">Note</span>
          <textarea
            rows={5}
            value={sticky.text}
            disabled={props.readOnly}
            onChange={(e) => update({ text: e.target.value })}
          />
        </label>
        <div className="field">
          <span className="field-label">Colour</span>
          <div className="flow-swatches">
            {(Object.entries(STICKY_COLORS) as [StickyColor, string][]).map(([name, color]) => (
              <button
                key={name}
                type="button"
                className={`flow-swatch ${sticky.color === name ? 'selected' : ''}`}
                style={{ background: color }}
                aria-label={`${name} note`}
                disabled={props.readOnly}
                onClick={() => update({ color: name })}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="flow-inspector-section">
        <h3>Task</h3>
        {!task ? (
          <>
            <p className="field-hint">Turn this note into something to do, for someone.</p>
            {!props.readOnly && (
              <button type="button" className="secondary-button" onClick={() => updateTask({ status: 'todo' })}>
                Make it a task
              </button>
            )}
          </>
        ) : (
          <>
            <label className="field">
              <span className="field-label">Status</span>
              <select
                value={task.status}
                disabled={props.readOnly}
                onChange={(e) => updateTask({ status: e.target.value as TaskStatus })}
              >
                {(Object.entries(TASK_STATUSES) as [TaskStatus, string][]).map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">For</span>
              <select
                value={assignee ? personKey(assignee) : ''}
                disabled={props.readOnly}
                onChange={(e) => {
                  const person = choices.find((candidate) => personKey(candidate) === e.target.value);
                  updateTask({ assignee: person?.name, assigneeEmail: person?.email });
                }}
              >
                <option value="">Not assigned</option>
                {choices.map((person) => (
                  <option key={personKey(person)} value={personKey(person)}>
                    {personLabel(person)}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                The helpline&apos;s people and the Aselo team. Someone missing? Add them under People on the boards
                page.
              </span>
            </label>
            <label className="field">
              <span className="field-label">Due</span>
              <input
                type="date"
                value={task.due ?? ''}
                disabled={props.readOnly}
                onChange={(e) => updateTask({ due: e.target.value || undefined })}
              />
            </label>
            {!props.readOnly && (
              <button type="button" className="link-button" onClick={() => update({ task: undefined })}>
                Not a task any more
              </button>
            )}
          </>
        )}
      </section>
    </>
  );
};

const ConnectionSettings = ({ edge, props }: { edge: ConnectionEdge; props: InspectorProps }) => {
  const source = props.nodes.find((node): node is ObjectNode => node.id === edge.source && node.type === 'object');
  const target = props.nodes.find((node) => node.id === edge.target);
  const exits = source ? exitsOf(source.data.object).filter(Boolean) : [];
  // Each way out leads to one place: those other connections use can't be picked
  const usedElsewhere = new Set(
    props.edges
      .filter((other) => other.source === edge.source && other.id !== edge.id)
      .map((other) => other.data?.exit),
  );
  const nameOf = (node?: CanvasNode) =>
    node?.type === 'object' ? node.data.object.text : node?.type === 'sticky' ? 'note' : 'frame';
  return (
    <section className="flow-inspector-section">
      <h3>Connection</h3>
      <p>
        From “{nameOf(source)}” to “{nameOf(target)}”
      </p>
      {exits.length > 0 && (
        <label className="field">
          <span className="field-label">Way out</span>
          <select
            value={edge.data?.exit ?? ''}
            disabled={props.readOnly}
            onChange={(e) => props.onEdgeExit(edge.id, e.target.value || undefined)}
          >
            <option value="">Not set</option>
            {exits.map((exit) => (
              <option key={exit} value={exit} disabled={usedElsewhere.has(exit)}>
                {exit}
                {usedElsewhere.has(exit) ? ' (already connected)' : ''}
              </option>
            ))}
          </select>
        </label>
      )}
    </section>
  );
};

const BoardSettings = ({ props }: { props: InspectorProps }) => {
  const frames = props.nodes.filter((node): node is FrameNode => node.type === 'frame');
  return (
    <>
      <section className="flow-inspector-section">
        <label className="field">
          <span className="field-label">Board title</span>
          <input
            type="text"
            value={props.title}
            disabled={props.readOnly}
            onChange={(e) => props.onTitleChange(e.target.value)}
          />
        </label>
      </section>
      <section className="flow-inspector-section">
        <h3>Frames</h3>
        {frames.length === 0 && <p className="field-hint">No frames yet. Add one from the left to hold a flow.</p>}
        <ul className="flow-frame-list">
          {frames.map((frame) => (
            <li key={frame.id}>
              <button type="button" className="link-button" onClick={() => props.onFocusFrame(frame.id)}>
                {frame.data.frame.title || 'Frame'}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="flow-inspector-section field-hint">
        <h3>Tips</h3>
        <ul className="flow-tips">
          <li>Drag from the dots on an object&apos;s sides to connect it to another.</li>
          <li>Double-click text to edit it.</li>
          <li>Move a frame by its title; objects dropped on a frame move with it.</li>
          <li>Shift-drag to select several. Ctrl+C / Ctrl+V copy, Ctrl+D duplicates, Delete removes.</li>
          <li>Ctrl+Z undoes, Ctrl+Y (or Ctrl+Shift+Z) redoes.</li>
        </ul>
      </section>
    </>
  );
};

export const Inspector = (props: InspectorProps) => {
  const selectedNodes = props.nodes.filter((node) => node.selected);
  const selectedEdges = props.edges.filter((edge) => edge.selected);
  const count = selectedNodes.length + selectedEdges.length;

  let content: JSX.Element;
  if (count === 0) {
    content = <BoardSettings props={props} />;
  } else if (count > 1) {
    content = (
      <section className="flow-inspector-section">
        <h3>{count} selected</h3>
      </section>
    );
  } else if (selectedEdges.length === 1) {
    content = <ConnectionSettings edge={selectedEdges[0]} props={props} />;
  } else {
    const [node] = selectedNodes;
    if (node.type === 'object') content = <ObjectSettings node={node} props={props} />;
    else if (node.type === 'frame') content = <FrameSettings node={node} props={props} />;
    else content = <StickySettings node={node} props={props} />;
  }

  return (
    <div className="flow-inspector" role="region" aria-label="Settings">
      {content}
      {count > 0 && !props.readOnly && (
        <div className="option-actions flow-inspector-actions">
          {selectedNodes.length > 0 && (
            <button type="button" className="secondary-button" onClick={props.onDuplicate}>
              Duplicate
            </button>
          )}
          <button type="button" className="secondary-button danger" onClick={props.onDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
