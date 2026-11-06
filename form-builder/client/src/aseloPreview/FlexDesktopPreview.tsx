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
 * A full-screen mock-up of the Aselo agent desktop in Flex, so staff can try their forms
 * where counselors will use them: Flex's header and side bar, the "Contacts waiting" panel,
 * the conversation in the middle and the contact form on the right.
 *
 * Only the form on the right is real (built from the draft definitions). The queues, the
 * task and the conversation are sample content.
 */
import { useEffect, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { DefinitionFileMap, getHelplineName } from '../common/definitions';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions, selectWorkspace, tryItOutClosed } from '../workspace/workspaceSlice';
import { AseloContactPanel } from './AseloContactPanel';
import {
  cannedResponseChosen,
  Channel,
  channelChanged,
  languageChanged,
  openPreview,
  selectPreview,
} from './previewSlice';
import {
  AddIcon,
  AdminIcon,
  AgentDesktopIcon,
  AnalyzeIcon,
  CallEndIcon,
  CaseListIcon,
  ChatIcon,
  ChevronDownIcon,
  DashboardsIcon,
  DialpadIcon,
  HamburgerIcon,
  MicIcon,
  PauseIcon,
  PhoneIcon,
  QualityIcon,
  QueuesIcon,
  ResourceMapIcon,
  SearchIcon,
  TeamsIcon,
} from './flexIcons';
import { AVAILABLE_LANGUAGES, Strings, translate, useStrings } from './translations';
import { getCannedResponses } from '../chatsAndCalls/sections';
import './aselo.css';
import './flexDesktop.css';

export type { PreviewFocus } from './previewSlice';

const SIDE_NAV = [
  { label: 'Admin', Icon: AdminIcon },
  { label: 'Agent Desktop', Icon: AgentDesktopIcon, active: true },
  { label: 'Teams', Icon: TeamsIcon },
  { label: 'Queues Stats', Icon: QueuesIcon },
  { label: 'Dashboards', Icon: DashboardsIcon },
  { label: 'Analyze', Icon: AnalyzeIcon },
  { label: 'Quality Management', Icon: QualityIcon },
  { label: 'Case List', Icon: CaseListIcon },
  { label: 'Search', Icon: SearchIcon },
  { label: 'Resource Map', Icon: ResourceMapIcon },
];

const MIN_TASK_WIDTH = 280;
const MIN_FORM_WIDTH = 520;

// The helpline's own welcome message (customStrings/Messages.json), if it has one
const welcomeMessage = (files: DefinitionFileMap, language: string) => {
  const messages = (files['customStrings/Messages.json'] ?? {}) as Record<string, Record<string, string>>;
  const [baseLanguage] = language.split('-');
  return (messages[baseLanguage] ?? messages.en)?.WelcomeMsg;
};

const ChatCanvas = ({
  files,
  language,
  strings,
  showCannedResponses,
}: {
  files: DefinitionFileMap;
  language: string;
  strings: Strings;
  showCannedResponses: boolean;
}) => {
  const dispatch = useAppDispatch();
  const welcome = welcomeMessage(files, language);
  const cannedResponses = getCannedResponses(files);
  const draftMessage = useAppSelector(selectPreview).message;
  const messages: { from: 'contact' | 'counselor'; author: string; text: string; time: string }[] = [
    { from: 'contact', author: 'Anonymous', text: 'Hi, I would like to talk to someone.', time: '10:02 AM' },
    ...(welcome ? [{ from: 'counselor' as const, author: 'Aselo', text: welcome, time: '10:03 AM' }] : []),
    {
      from: 'counselor',
      author: 'You',
      text: "Hi, thanks for reaching out. I'm here to listen. What's going on today?",
      time: '10:03 AM',
    },
    {
      from: 'contact',
      author: 'Anonymous',
      text: "I've been feeling really overwhelmed lately and didn't know who to contact.",
      time: '10:05 AM',
    },
    {
      from: 'counselor',
      author: 'You',
      text: "I'm glad you reached out. Can you tell me a bit more about what's been happening?",
      time: '10:05 AM',
    },
  ];
  return (
    <>
      <div className="flex-messages">
        {messages.map((message, index) => (
          <div key={index} className={`flex-message flex-message-${message.from}`}>
            <div className="flex-message-meta">
              <strong>{message.author}</strong> {message.time}
            </div>
            <div className="flex-message-bubble">{message.text}</div>
          </div>
        ))}
      </div>
      {showCannedResponses && (
        // CannedResponses in plugin-hrm-form, added above the message box
        <div className="flex-canned-responses">
          <span className="aselo-select-wrapper aselo-select-full">
            <select
              className="aselo-select aselo-select-full"
              aria-label={translate(strings, 'CannedResponses')}
              value=""
              onChange={e => dispatch(cannedResponseChosen(e.target.value))}
            >
              <option value="" disabled>
                {translate(strings, 'CannedResponses')}
              </option>
              {cannedResponses.map((response, index) => (
                <option key={index} value={response.text}>
                  {response.label}
                </option>
              ))}
            </select>
          </span>
        </div>
      )}
      <div className="flex-message-input">
        {draftMessage ? (
          <span className="flex-message-draft">{draftMessage}</span>
        ) : (
          <span className="flex-message-placeholder">Type message</span>
        )}
        <span className="flex-send-button">Send</span>
      </div>
    </>
  );
};

const CallCanvas = () => (
  <div className="flex-call">
    <div className="flex-call-avatar">
      <PhoneIcon size={36} />
    </div>
    <div className="flex-call-name">Anonymous</div>
    <div className="flex-call-status">Live | 04:12</div>
    <div className="flex-call-actions">
      <span className="flex-call-button" title="Mute">
        <MicIcon />
      </span>
      <span className="flex-call-button" title="Hold">
        <PauseIcon />
      </span>
      <span className="flex-call-button flex-call-hangup" title="Hang up">
        <CallEndIcon />
      </span>
    </div>
  </div>
);

const ContactsWaiting = ({ channel, queueName }: { channel: Channel; queueName: string }) => (
  <aside className="flex-queues" aria-label="Contacts waiting (sample)">
    <h2 className="flex-queues-title">Contacts waiting</h2>
    <div className="flex-queues-list">
      {[queueName].map(queue => (
        <div key={queue} className="flex-queue">
          <p className="flex-queue-name">{queue}</p>
          <div className="flex-channel-boxes">
            {[
              ['Calls', 'calls'],
              ['SMS', 'sms'],
              ['Chat', 'chat'],
            ].map(([label, kind]) => (
              <div key={kind} className="flex-channel-box">
                <div className={`flex-channel-count flex-channel-${kind}`}>—</div>
                <p>{label}</p>
              </div>
            ))}
          </div>
          <p className="flex-wait">
            Longest wait time: <strong>none</strong>
          </p>
        </div>
      ))}
    </div>
    <h2 className="flex-queues-title">Tasks</h2>
    <div className="flex-task selected">
      <span className="flex-task-icon">{channel === 'chat' ? <ChatIcon size={22} /> : <PhoneIcon size={22} />}</span>
      <span>
        <strong>Anonymous</strong>
        <small>{channel === 'chat' ? 'Chat' : 'Call'} | Live 04:12</small>
      </span>
    </div>
    <h2 className="flex-queues-title">Add...</h2>
    {['Another Task', 'Offline Contact Record'].map(label => (
      <div key={label} className="flex-task disabled">
        <span className="flex-task-icon">
          <AddIcon size={22} />
        </span>
        <span>{label}</span>
      </div>
    ))}
  </aside>
);

// Opens on what workspace tryItOut says; the preview's state and logic live in previewSlice.ts
export const FlexDesktopPreview = () => {
  const dispatch = useAppDispatch();
  const definitions = useAppSelector(selectDefinitions);
  // The draft files (what's being edited), rather than the files as loaded
  const files = useAppSelector(selectDraftFiles);
  const { tryItOut } = useAppSelector(selectWorkspace);
  const { opened, channel, language, saveResult } = useAppSelector(selectPreview);
  const focus = tryItOut?.focus ?? 'form';
  // Shown when the helpline's enable_canned_responses flag is on (Aselo needs it set), or while
  // editing them
  const cannedResponsesEnabled = definitions?.featureFlags?.enable_canned_responses === true;
  const showCannedResponses = cannedResponsesEnabled || focus === 'cannedResponses';
  const strings: Strings = useStrings(language, files);

  // Starts afresh each time it's opened
  useEffect(() => {
    if (tryItOut) dispatch(openPreview());
  }, [dispatch, tryItOut]);

  // Share of the space taken by the conversation; the form gets the rest (Flex's splitter).
  // Only how the screen is laid out, so it stays here
  const [taskShare, setTaskShare] = useState(0.5);
  const splitterArea = useRef<HTMLDivElement>(null);
  const startDrag = (event: React.PointerEvent) => {
    event.preventDefault();
    const area = splitterArea.current;
    if (!area) return;
    const move = (moveEvent: PointerEvent) => {
      const { left, width } = area.getBoundingClientRect();
      const taskWidth = Math.min(Math.max(moveEvent.clientX - left, MIN_TASK_WIDTH), width - MIN_FORM_WIDTH);
      setTaskShare(taskWidth / width);
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  if (!tryItOut || !opened || !definitions) return null;
  const onClose = () => dispatch(tryItOutClosed());
  // The sample task's queue, named after the helpline
  const queueName = getHelplineName(files, definitions.code);

  return (
    <div className="flex-preview-overlay" role="dialog" aria-modal="true" aria-label="Try it out in Aselo">
      <div className="flex-preview-bar">
        <strong>Try it out</strong>
        <span className="flex-preview-note">The form on the right is your draft. Everything else is a sample.</span>
        <label>
          Task
          <select value={channel} onChange={e => dispatch(channelChanged(e.target.value as Channel))}>
            <option value="chat">Chat</option>
            <option value="call">Call</option>
          </select>
        </label>
        <label>
          Language
          <select value={language} onChange={e => dispatch(languageChanged(e.target.value))}>
            {[...new Set([language, ...AVAILABLE_LANGUAGES])].map(code => (
              <option key={code} value={code}>
                {code}
                {code === definitions.helplineLanguage ? ' (this helpline)' : ''}
              </option>
            ))}
          </select>
        </label>
        {focus === 'cannedResponses' && !cannedResponsesEnabled && (
          <span className="flex-preview-invalid">
            Canned responses are switched off for this helpline (enable_canned_responses), so counselors don&apos;t see
            them yet.
          </span>
        )}
        {saveResult === 'saved' && <span className="flex-preview-ok">Aselo would save this contact.</span>}
        {saveResult === 'invalid' && (
          <span className="flex-preview-invalid">Aselo wouldn&apos;t save it yet: check the tabs marked in red.</span>
        )}
        <button type="button" className="flex-preview-close" onClick={onClose}>
          Back to editing
        </button>
      </div>

      <div className="flex-desktop">
        <header className="flex-header">
          <span className="flex-header-icon">
            <HamburgerIcon />
          </span>
          {/* Without a logo, Aselo shows nothing here */}
          {definitions.logoUrl && <img className="flex-logo" src={definitions.logoUrl} alt="Helpline logo" />}
          <span className="flex-header-spacer" />
          <span className="flex-header-icon" title="Outbound Dialpad">
            <DialpadIcon />
          </span>
          <span className="flex-activity">
            <span className="flex-activity-dot" />
            Available | 04:12
            <ChevronDownIcon size={18} />
          </span>
          <span className="flex-avatar" aria-label="Counselor">
            CS
          </span>
        </header>

        <div className="flex-main">
          <nav className="flex-sidenav" aria-label="Side bar (sample)">
            {SIDE_NAV.map(({ label, Icon, active }) => (
              <span key={label} className={active ? 'flex-sidenav-link active' : 'flex-sidenav-link'} title={label}>
                <Icon />
              </span>
            ))}
          </nav>

          <ContactsWaiting channel={channel} queueName={queueName} />

          <div className="flex-splitter" ref={splitterArea}>
            <section
              className="flex-panel flex-task-canvas"
              style={{ flexBasis: `${taskShare * 100}%` }}
              aria-label="Conversation (sample)"
            >
              <div className="flex-canvas-header">
                <span className="flex-canvas-icon">
                  {channel === 'chat' ? <ChatIcon size={20} /> : <PhoneIcon size={20} />}
                </span>
                <span className="flex-canvas-title">
                  <strong>Anonymous</strong>
                  <small>{channel === 'chat' ? 'Chat' : 'Call'} | Live 04:12</small>
                </span>
                <span className="flex-end-button">{channel === 'chat' ? 'End Chat' : 'Hang Up'}</span>
              </div>
              {channel === 'chat' ? (
                <ChatCanvas
                  files={files}
                  language={language}
                  strings={strings}
                  showCannedResponses={showCannedResponses}
                />
              ) : (
                <CallCanvas />
              )}
            </section>

            <div
              className="flex-separator"
              role="separator"
              aria-orientation="vertical"
              aria-label="Drag to resize"
              onPointerDown={startDrag}
            />

            <section className="flex-panel flex-crm" aria-label="Contact form">
              <AseloContactPanel strings={strings} queueName={queueName} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
