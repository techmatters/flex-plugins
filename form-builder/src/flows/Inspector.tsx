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
  composeName,
  exitsOf,
  FlowObjectType,
  fieldProblem,
  fieldShown,
  isNamedByParts,
  lockedPrefixesOf,
  composePrefixed,
  prefixedName,
  standardPrefixedName,
  variableKeyProblem,
  messageChannelOf,
  messageFor,
  nameParts,
  namingChoicesOf,
  variesByVariant,
  withVariantMessage,
  FlowStage,
  OBJECT_COLORS,
  OBJECT_TYPES,
  objectColor,
  standardStudioName,
  STICKY_COLORS,
  StickyColor,
  suggestStudioName,
  TASK_STATUSES,
  TaskStatus,
  toSnake,
} from './model';
import type {
  BoardContent,
  FlowDetails,
  FlowNaming,
  FlowObject,
  FlowVariable,
  Frame,
  NameParts,
  PrefixedName,
  NamingChoices,
  ObjectField,
  Person,
} from './model';
import { hasNonStandardRecording, isVoiceMessage, playsWaitRecording, withStudioName } from './recordings';
import { AutoTextarea } from '../components/AutoTextarea';
import { CanvasNode, ConnectionEdge, FrameNode, newId, ObjectNode, StickyNode } from './canvasModel';
import type { HelplineChoices } from './boardClient';
import type { Issue } from './checks';
import { uniqueName } from './checks';
import { RecordingActions, RecordingSection, ScriptApproval } from './RecordingControls';
import { TaskAttributesSection } from './TaskAttributesSection';

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
  // The variant shown, for flows sharing a template (FlowDetails.variants): its texts are edited
  variant?: string;
  // The helpline's chatbots, queues, workflows and skills, offered in objects' settings
  helplineChoices?: HelplineChoices;
  // Read them again (e.g. a skill was just added in Routing)
  onRefreshChoices?: () => void;
  // The board's own flow's settings changed (its objects outside frames)
  onBoardFlow?: (flow: FlowDetails) => void;
};

/**
 * A message's name as its parts: the prefix (set by its kind), then the flow's channel, language
 * and service (chosen; filled in when the flow has one), then what it is.
 */
// Where each kind of suggestion comes from, for when there are none yet
const SUGGESTIONS_FROM = {
  chatbots: 'chatbots in the Chatbots designer',
  queues: 'queues in its routing design',
  workflows: 'workflows in its routing design',
  skills: 'skills in its routing design',
} as const;

// The values offered for a field, with what tells them apart (a bot's languages, a queue's name)
const suggestionsFor = (source: ObjectField['suggestions'], choices?: HelplineChoices) => {
  if (!source || !choices) return [];
  if (source === 'chatbots') {
    return [...new Set(choices.chatbots.map((bot) => bot.name))].map((name) => ({
      value: name,
      detail: choices.chatbots
        .filter((bot) => bot.name === name)
        .map((bot) => bot.language)
        .join(', '),
    }));
  }
  if (source === 'skills') return choices.skills.map((skill) => ({ value: skill, detail: '' }));
  return choices[source].map(({ key, name }) => ({ value: key, detail: name === key ? '' : name }));
};

const NamePartsEditor = ({
  name,
  prefix,
  postqueue,
  choices,
  channel,
  language,
  readOnly,
  onChange,
}: {
  name?: string;
  prefix: string;
  postqueue: boolean;
  choices: NamingChoices;
  // The message's own channel and language, for a new name
  channel?: string;
  language?: string;
  readOnly: boolean;
  onChange: (name: string | undefined) => void;
}) => {
  const only = (values: string[]) => (values.length === 1 ? values[0] : undefined);
  const parts: NameParts = (name && nameParts(name, prefix, choices)) || {
    postqueue,
    prefix,
    channel: choices.channels.includes(channel ?? '') ? channel : (only(choices.channels) ?? channel),
    language: choices.languages.includes(language ?? '') ? language : only(choices.languages),
    service: only(choices.services),
    rest: '',
  };
  const set = (changes: Partial<NameParts>) => {
    // Lower case and underscores, kept as typed (a trailing underscore while typing service_menu)
    const rest = (changes.rest ?? parts.rest).toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    const next = { ...parts, ...changes, rest };
    onChange(next.rest || next.channel || next.language || next.service ? composeName(next) : undefined);
  };
  // The flow's only value is filled in (shown as it is); several are chosen from
  const select = (label: string, key: 'channel' | 'language' | 'service', values: string[]) => {
    if (values.length === 0) return null;
    if (values.length === 1 && parts[key] === values[0]) {
      return (
        <span className="flow-name-part" title={`The flow's only ${label.toLowerCase()}`}>
          {values[0]}
        </span>
      );
    }
    return (
      <select
        aria-label={`Name's ${label.toLowerCase()}`}
        title={label}
        value={parts[key] ?? ''}
        disabled={readOnly}
        onChange={(e) => set({ [key]: e.target.value || undefined })}
      >
        <option value="">no {label.toLowerCase()}</option>
        {values.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    );
  };
  return (
    <div className="field">
      <span className="field-label">Studio name</span>
      <div className="flow-name-parts">
        <span className="flow-name-prefix" title="Set by the kind of widget">
          {parts.postqueue ? 'postqueue_' : ''}
          {prefix}
        </span>
        {select('Channel', 'channel', choices.channels)}
        {select('Language', 'language', choices.languages)}
        {select('Service', 'service', choices.services)}
        <input
          type="text"
          aria-label="What it is"
          value={parts.rest}
          placeholder="service_menu"
          disabled={readOnly}
          spellCheck={false}
          onChange={(e) => set({ rest: e.target.value })}
        />
      </div>
      {name && <code className="flow-name-full">{name}</code>}
    </div>
  );
};

/**
 * A name whose start is fixed by its kind (split_, set_var_, f_isSkilledWorkerAvailable...): only
 * the rest is typed. Functions and requests choose theirs (f_, http_get_, http_post_).
 */
const PrefixedNameEditor = ({
  name,
  prefixes,
  postqueue,
  placeholder,
  readOnly,
  onChange,
}: {
  name?: string;
  prefixes: string[];
  postqueue: boolean;
  placeholder?: string;
  readOnly: boolean;
  onChange: (name: string | undefined) => void;
}) => {
  // The start chosen before anything else is typed (a name isn't kept until then)
  const [chosen, setChosen] = useState<string>();
  const parts: PrefixedName = (name && prefixedName(name, prefixes)) || {
    postqueue,
    prefix: chosen && prefixes.includes(chosen) ? chosen : prefixes[0],
    rest: '',
  };
  const set = (changes: Partial<PrefixedName>) => {
    if (changes.prefix) setChosen(changes.prefix);
    const next = { ...parts, ...changes };
    // Function names are camelCase (f_getProfileFlagsForIdentifier); the rest is lower case
    const rest = next.prefix.startsWith('f_')
      ? next.rest.replace(/[^A-Za-z0-9_]+/g, '_')
      : next.rest.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    // A route's name is complete without a suffix; other kinds need the rest
    onChange(rest || !next.prefix.endsWith('_') ? composePrefixed({ ...next, rest }) : undefined);
  };
  return (
    <div className="field">
      <span className="field-label">Studio name</span>
      <div className="flow-name-parts">
        {parts.postqueue && (
          <span className="flow-name-prefix" title="Everything after the queue">
            postqueue_
          </span>
        )}
        {prefixes.length > 1 ? (
          <select
            aria-label="Name's start"
            value={parts.prefix}
            disabled={readOnly}
            onChange={(e) => set({ prefix: e.target.value })}
          >
            {prefixes.map((prefix) => (
              <option key={prefix} value={prefix}>
                {prefix}
              </option>
            ))}
          </select>
        ) : (
          <span className="flow-name-prefix" title="Set by the kind of widget">
            {parts.prefix}
            {parts.prefix.endsWith('_') ? '' : '_'}
          </span>
        )}
        <input
          type="text"
          aria-label="What it is"
          value={parts.rest}
          placeholder={placeholder}
          disabled={readOnly}
          spellCheck={false}
          onChange={(e) => set({ rest: e.target.value })}
        />
      </div>
      {name && <code className="flow-name-full">{name}</code>}
    </div>
  );
};

/**
 * Set variable: the flow variables it sets, in order. Studio keeps them as text; later widgets
 * read them as {{flow.variables.<key>}}, and the value can use {{...}} too.
 */
const VariablesSection = ({
  variables = [],
  readOnly,
  onChange,
}: {
  variables?: FlowVariable[];
  readOnly: boolean;
  onChange: (variables: FlowVariable[] | undefined) => void;
}) => {
  const set = (index: number, changes: Partial<FlowVariable>) =>
    onChange(variables.map((variable, at) => (at === index ? { ...variable, ...changes } : variable)));
  return (
    <section className="flow-inspector-section" aria-label="Variables">
      <h3>Variables</h3>
      <p className="field-hint">
        Read later as <code>{'{{flow.variables.<key>}}'}</code>. A value can use <code>{'{{…}}'}</code>, e.g.{' '}
        <code>{'{{widgets.gather_input_voice_en_menu.Digits}}'}</code>.
      </p>
      {variables.map((variable, index) => (
        <div key={index} className="flow-variable-row">
          <input
            type="text"
            aria-label={`Variable ${index + 1} key`}
            value={variable.key}
            placeholder="language"
            disabled={readOnly}
            spellCheck={false}
            aria-invalid={Boolean(variable.key && variableKeyProblem(variable.key))}
            onChange={(e) => set(index, { key: e.target.value.trim() })}
          />
          <span aria-hidden>=</span>
          <input
            type="text"
            aria-label={`Variable ${index + 1} value`}
            value={variable.value}
            placeholder="es"
            disabled={readOnly}
            spellCheck={false}
            onChange={(e) => set(index, { value: e.target.value })}
          />
          {!readOnly && (
            <button
              type="button"
              className="link-button"
              aria-label={`Remove variable ${index + 1}`}
              onClick={() => {
                const rest = variables.filter((_, at) => at !== index);
                onChange(rest.length > 0 ? rest : undefined);
              }}
            >
              ×
            </button>
          )}
          {variable.key && variableKeyProblem(variable.key) && (
            <span className="flow-field-problem">{variableKeyProblem(variable.key)}</span>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => onChange([...variables, { key: '', value: '' }])}
        >
          Add a variable
        </button>
      )}
    </section>
  );
};

// A comma-separated list, kept as typed until it's left
const ListInput = ({
  label,
  values,
  placeholder,
  hint,
  readOnly,
  onChange,
}: {
  label: string;
  values?: string[];
  placeholder?: string;
  hint: string;
  readOnly: boolean;
  onChange: (values: string[] | undefined) => void;
}) => {
  const [text, setText] = useState<string>();
  const shown = text ?? (values ?? []).join(', ');
  const commit = () => {
    if (text === undefined) return;
    const list = [...new Set(text.split(',').map(toSnake).filter(Boolean))];
    onChange(list.length > 0 ? list : undefined);
    setText(undefined);
  };
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        type="text"
        value={shown}
        placeholder={placeholder}
        disabled={readOnly}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
      <span className="field-hint">{hint}</span>
    </label>
  );
};

/**
 * The flow's channels, languages and services: the parts its messages' names are built from
 * (gather_input_voice_en_childhelp_service_menu).
 */
const NamingSection = ({
  details,
  objects,
  readOnly,
  onChange,
}: {
  details?: Pick<Frame, 'channel' | 'naming'>;
  objects: FlowObject[];
  readOnly: boolean;
  onChange: (naming: FlowNaming | undefined) => void;
}) => {
  const naming = details?.naming ?? {};
  // What's used when nothing is set: the flow's channel, its messages' languages
  const found = namingChoicesOf(details ? { ...details, naming: undefined } : undefined, objects);
  const set = (key: keyof FlowNaming, values: string[] | undefined) => {
    const { [key]: _removed, ...others } = naming;
    const next = values ? { ...others, [key]: values } : others;
    onChange(Object.keys(next).length > 0 ? next : undefined);
  };
  return (
    <section className="flow-inspector-section">
      <h3>Names</h3>
      <p className="field-hint">
        Messages, menus and questions are named{' '}
        <code>&lt;prefix&gt;&lt;channel&gt;_&lt;language&gt;_&lt;service&gt;_…</code>, e.g.{' '}
        <code>gather_input_voice_en_childhelp_service_menu</code>. One value is filled in by itself; several are chosen
        from.
      </p>
      <ListInput
        label="Channels"
        values={naming.channels}
        placeholder={found.channels.join(', ') || 'voice'}
        hint="Comma-separated. Empty: the flow's channel."
        readOnly={readOnly}
        onChange={(values) => set('channels', values)}
      />
      <ListInput
        label="Languages"
        values={naming.languages}
        placeholder={found.languages.join(', ') || 'en, es'}
        hint="Empty: the languages its messages are in."
        readOnly={readOnly}
        onChange={(values) => set('languages', values)}
      />
      <ListInput
        label="Services"
        values={naming.services}
        placeholder="childhelp, tya"
        hint="e.g. the lines or programs the flow serves. Optional."
        readOnly={readOnly}
        onChange={(values) => set('services', values)}
      />
    </section>
  );
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
  // The object's frame, or the board's own flow (an imported board's) when it's outside frames
  const details = frame ? frame.data.frame : props.content.flow;
  // The flow's channels, languages and services, the parts messages' names are built from
  const choices = namingChoicesOf(
    details,
    props.content.objects.filter((candidate) => candidate.frameId === node.parentId),
  );
  const suggested = suggestStudioName(object, details, choices);
  const recordingList = props.recordings.list?.recordings;
  // Renamed, a message keeps playing its recording until the file is copied to the new name
  const rename = (studioName: string | undefined) =>
    onNodeData(node.id, { object: withStudioName(object, studioName, recordingList) });
  // The name it should have: messages' by parts, others' with their kind's start
  const standard = isNamedByParts(object.type)
    ? standardStudioName(object, details, choices)
    : standardPrefixedName(object, details);
  const useStandard = async () => {
    if (!standard) return;
    const renamed = withStudioName(object, standard, recordingList);
    onNodeData(node.id, { object: renamed });
    // Aselo staff: its recording copied to the new name straight away
    if (props.recordings.rename && hasNonStandardRecording(renamed))
      await props.recordings.rename([node.id], [renamed]);
  };
  // Not one another object in the same flow already has
  const suggestion = suggested && uniqueName(suggested, { id: node.id, frameId: node.parentId }, props.content);
  const problems = props.problems.get(node.id) ?? [];
  const showsChannel = info.hasMessage || object.type === 'incoming';
  // The message as the shown variant has it (flows sharing a template), and changing it there
  const variants = props.content.flow?.variants ?? [];
  const mainVariant = variants[0]?.key;
  const shownVariant = variants.find((candidate) => candidate.key === props.variant);
  const message = messageFor(object, props.variant, mainVariant);
  const setMessage = (changed: NonNullable<typeof message>) => {
    const next = withVariantMessage(object, props.variant, mainVariant, changed);
    update({ message: next.message, variantMessages: next.variantMessages });
  };
  const sharedText = variants.length > 1 && !variesByVariant(object);
  const shown = { ...object, message };

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
          {info.hasMessage && variants.length > 1 && shownVariant && (
            <p className="field-hint flow-variant-hint">
              {sharedText
                ? 'This text is written in the template the flows share: changing it changes every one of them.'
                : `${shownVariant.label} (${shownVariant.key}): this flow's own script${message?.channel === 'voice' ? ' and recording' : ''}.`}
            </p>
          )}
          {info.hasMessage && (
            <>
              <label className="field">
                <span className="field-label">Language</span>
                <input
                  type="text"
                  list="flow-languages"
                  value={message?.language ?? ''}
                  disabled={readOnly}
                  placeholder="en"
                  onChange={(e) => setMessage({ ...message, language: e.target.value || undefined })}
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
                  value={message?.script ?? ''}
                  disabled={readOnly}
                  placeholder="What the caller hears, or the message sent"
                  onChange={(e) => setMessage({ ...message, script: e.target.value || undefined })}
                />
              </label>
            </>
          )}
        </section>
      )}

      {info.hasMessage && (
        <>
          <RecordingSection object={shown} frame={details} actions={props.recordings} />
          <ScriptApproval
            object={shown}
            frame={details}
            staff={props.recordings.staff}
            readOnly={readOnly}
            userName={props.userName}
            onApprove={(approved) => setMessage({ ...message, approved })}
          />
        </>
      )}

      {info.studioPrefix && (
        <section className="flow-inspector-section">
          {isNamedByParts(object.type) &&
          (!object.studioName || nameParts(object.studioName, info.studioPrefix, choices)) ? (
            <NamePartsEditor
              name={object.studioName}
              prefix={info.studioPrefix}
              postqueue={details?.stage === 'postqueue'}
              choices={choices}
              channel={messageChannelOf(object, details)}
              language={object.message?.language}
              readOnly={readOnly}
              onChange={rename}
            />
          ) : !isNamedByParts(object.type) &&
            (!object.studioName || prefixedName(object.studioName, lockedPrefixesOf(object))) ? (
            <PrefixedNameEditor
              key={node.id}
              name={object.studioName}
              prefixes={lockedPrefixesOf(object)}
              postqueue={details?.stage === 'postqueue'}
              placeholder={suggestion && prefixedName(suggestion, lockedPrefixesOf(object))?.rest}
              readOnly={readOnly}
              onChange={rename}
            />
          ) : (
            // A name that doesn't start as its kind's do (imported): as it is, until it's given one
            <label className="field">
              <span className="field-label">Studio name</span>
              <input
                type="text"
                value={object.studioName ?? ''}
                disabled={readOnly}
                placeholder={suggestion}
                onChange={(e) => rename(e.target.value.trim() || undefined)}
              />
            </label>
          )}
          <span className="field-hint">
            The widget&apos;s name in Studio
            {info.hasMessage && object.message?.channel === 'voice' ? ' and its recording file' : ''}.
            {isNamedByParts(object.type) && ' Channels, languages and services are set for the flow (its settings).'}
          </span>
          {!readOnly && standard && standard !== object.studioName && (
            <button type="button" className="link-button" onClick={useStandard}>
              Use the standard name: {standard}
              {object.studio && isVoiceMessage(object, details) ? ' (its recording is copied to it)' : ''}
            </button>
          )}
          {!readOnly && !standard && suggestion && suggestion !== object.studioName && (
            <button type="button" className="link-button" onClick={() => rename(suggestion)}>
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
          {object.type === 'function' && object.studio?.type === 'run-function' && (
            <p className="field-hint">
              A Twilio Function in Studio (<code>run-function</code>): its settings stay as they are live.
            </p>
          )}
          {info.fields
            .filter((field) => fieldShown(field, object.settings))
            .map((field) => {
              const value = object.settings?.[field.key] ?? '';
              const suggestions = suggestionsFor(field.suggestions, props.helplineChoices);
              // Skills are a comma-separated list: they're added to it, not chosen instead of it
              const listed = value.split(',').map((item) => item.trim());
              const set = (newValue: string) => {
                const { [field.key]: _removed, ...others } = object.settings ?? {};
                const settings: Record<string, string> = newValue ? { ...others, [field.key]: newValue } : others;
                // A chatbot of the helpline's chosen: its language too (Lex's en_USCH is en-USCH here)
                const bot =
                  field.suggestions === 'chatbots' &&
                  props.helplineChoices?.chatbots.find((candidate) => candidate.name === newValue);
                if (bot && !settings.language) settings.language = bot.language.replace('_', '-');
                update({ settings: Object.keys(settings).length > 0 ? settings : undefined });
              };
              return (
                <label key={field.key} className="field">
                  <span className="field-label">{field.label}</span>
                  {field.options ? (
                    <select value={value} disabled={readOnly} onChange={(e) => set(e.target.value)}>
                      <option value="">{field.optionLabels?.[''] ?? 'Not set'}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {field.optionLabels?.[option] ?? option}
                        </option>
                      ))}
                    </select>
                  ) : field.kind === 'json' ? (
                    <AutoTextarea
                      className="flow-field-json"
                      value={value}
                      minRows={4}
                      placeholder={field.placeholder}
                      disabled={readOnly}
                      spellCheck={false}
                      aria-invalid={Boolean(fieldProblem(field, value))}
                      onChange={(e) => set(e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.kind === 'url' ? 'url' : 'text'}
                      inputMode={field.kind === 'number' ? 'numeric' : undefined}
                      className={field.kind === 'url' ? 'flow-field-url' : undefined}
                      list={
                        suggestions.length > 0 && field.suggestions !== 'skills'
                          ? `suggestions-${node.id}-${field.key}`
                          : undefined
                      }
                      onFocus={field.suggestions ? props.onRefreshChoices : undefined}
                      value={value}
                      placeholder={field.placeholder}
                      disabled={readOnly}
                      spellCheck={field.kind === 'url' ? false : undefined}
                      aria-invalid={Boolean(fieldProblem(field, value))}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                  {suggestions.length > 0 && field.suggestions !== 'skills' && (
                    <datalist id={`suggestions-${node.id}-${field.key}`}>
                      {suggestions.map(({ value: offered, detail }) => (
                        <option key={offered} value={offered}>
                          {detail}
                        </option>
                      ))}
                    </datalist>
                  )}
                  {field.suggestions === 'skills' && !readOnly && (
                    <span className="flow-field-choices" aria-label={`Add to ${field.label}`}>
                      {suggestions
                        .filter(({ value: skill }) => !listed.includes(skill))
                        .map(({ value: skill }) => (
                          <button
                            key={skill}
                            type="button"
                            className="flow-field-choice"
                            onClick={() => set(value.trim() ? `${value.replace(/,\s*$/, '')},${skill}` : skill)}
                          >
                            + {skill}
                          </button>
                        ))}
                    </span>
                  )}
                  {field.suggestions && suggestions.length === 0 && (
                    <span className="field-hint">
                      This helpline has no {SUGGESTIONS_FROM[field.suggestions]} yet: type it.
                    </span>
                  )}
                  {fieldProblem(field, value) && (
                    <span className="flow-field-problem">{fieldProblem(field, value)}</span>
                  )}
                  {field.hint && <span className="field-hint">{field.hint}</span>}
                </label>
              );
            })}
        </section>
      )}

      {playsWaitRecording(object) && (
        <RecordingSection object={object} frame={details} actions={props.recordings} title="Wait music" />
      )}

      {object.type === 'setVariable' && (
        <VariablesSection
          variables={object.variables}
          readOnly={readOnly}
          onChange={(variables) => update({ variables })}
        />
      )}

      {object.type === 'sendToQueue' && (
        <TaskAttributesSection
          attributes={object.taskAttributes}
          channel={details?.channel}
          readOnly={readOnly}
          onChange={(taskAttributes) => update({ taskAttributes })}
        />
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
      <NamingSection
        details={frame}
        objects={props.content.objects.filter((object) => object.frameId === node.id)}
        readOnly={props.readOnly}
        onChange={(naming) => update({ naming })}
      />
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
  // The board's own flow: its objects outside frames (an imported board's are all there)
  const unframed = props.content.objects.filter((object) => !object.frameId);
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
      {props.onBoardFlow && (props.content.flow || unframed.length > 0) && (
        <NamingSection
          details={props.content.flow}
          objects={unframed}
          readOnly={props.readOnly}
          onChange={(naming) => props.onBoardFlow?.({ ...props.content.flow, naming })}
        />
      )}
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
