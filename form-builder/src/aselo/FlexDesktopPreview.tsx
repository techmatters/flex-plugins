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
import { useRef, useState } from 'react';
import type { DefinitionFiles } from '../../server/definitionsApi';
import type { ContactTab } from '../definitions';
import { CONTACT_TABS, DefinitionFileMap, getForm } from '../definitions';
import { AseloContactPanel, CallType, SaveResult } from './AseloContactPanel';
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
import './aselo.css';
import './flexDesktop.css';

type Channel = 'chat' | 'call';

type Props = {
  definitions: DefinitionFiles;
  // The draft files (what's being edited), rather than the files as loaded
  files: DefinitionFileMap;
  initialTab?: ContactTab['key'];
  onClose: () => void;
};

// The "Contacts waiting" panel shows one sample queue, named after the default helpline
const helplineName = (definitions: DefinitionFiles, files: DefinitionFileMap) => {
  const info = files['HelplineInformation.json'] as
    | { helplines?: { label?: string; value: string; default?: boolean }[] }
    | undefined;
  const helplines = info?.helplines ?? [];
  const helpline = helplines.find((h) => h.default) ?? helplines[0];
  return helpline?.label || helpline?.value || definitions.code.toUpperCase();
};

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
  const messages = (files['customStrings/Messages.json'] ?? {}) as Record<
    string,
    Record<string, string>
  >;
  const [baseLanguage] = language.split('-');
  return (messages[baseLanguage] ?? messages.en)?.WelcomeMsg;
};

const ChatCanvas = ({ files, language }: { files: DefinitionFileMap; language: string }) => {
  const welcome = welcomeMessage(files, language);
  const messages: { from: 'contact' | 'counselor'; author: string; text: string; time: string }[] = [
    { from: 'contact', author: 'Anonymous', text: 'Hi, I would like to talk to someone.', time: '10:02 AM' },
    ...(welcome
      ? [{ from: 'counselor' as const, author: 'Aselo', text: welcome, time: '10:03 AM' }]
      : []),
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
      <div className="flex-message-input">
        <span className="flex-message-placeholder">Type message</span>
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
      {[queueName].map((queue) => (
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
    {['Another Task', 'Offline Contact Record'].map((label) => (
      <div key={label} className="flex-task disabled">
        <span className="flex-task-icon">
          <AddIcon size={22} />
        </span>
        <span>{label}</span>
      </div>
    ))}
  </aside>
);

export const FlexDesktopPreview = ({ definitions, files, initialTab, onClose }: Props) => {
  const hasCallerForm = (getForm(files, CONTACT_TABS[0].filePath) ?? []).length > 0;
  const [callType, setCallType] = useState<CallType>(
    initialTab === 'CallerInformationTab' && hasCallerForm ? 'caller' : 'child',
  );
  const [channel, setChannel] = useState<Channel>('chat');
  const [language, setLanguage] = useState(definitions.helplineLanguage ?? 'en-US');
  const [saveResult, setSaveResult] = useState<SaveResult>();
  const strings: Strings = useStrings(language, files);

  // Share of the space taken by the conversation; the form gets the rest (Flex's splitter)
  const [taskShare, setTaskShare] = useState(0.5);
  const splitterArea = useRef<HTMLDivElement>(null);
  const startDrag = (event: React.PointerEvent) => {
    event.preventDefault();
    const area = splitterArea.current;
    if (!area) return;
    const move = (moveEvent: PointerEvent) => {
      const { left, width } = area.getBoundingClientRect();
      const taskWidth = Math.min(
        Math.max(moveEvent.clientX - left, MIN_TASK_WIDTH),
        width - MIN_FORM_WIDTH,
      );
      setTaskShare(taskWidth / width);
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  return (
    <div className="flex-preview-overlay" role="dialog" aria-modal="true" aria-label="Try it out in Aselo">
      <div className="flex-preview-bar">
        <strong>Try it out</strong>
        <span className="flex-preview-note">
          The form on the right is your draft. Everything else is a sample.
        </span>
        <label>
          Kind of contact
          <select
            value={callType}
            onChange={(e) => {
              setCallType(e.target.value as CallType);
              setSaveResult(undefined);
            }}
          >
            <option value="child">{translate(strings, 'CallType-child')}</option>
            <option value="caller" disabled={!hasCallerForm}>
              {translate(strings, 'CallType-caller')}
            </option>
          </select>
        </label>
        <label>
          Task
          <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            <option value="chat">Chat</option>
            <option value="call">Call</option>
          </select>
        </label>
        <label>
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {[...new Set([language, ...AVAILABLE_LANGUAGES])].map((code) => (
              <option key={code} value={code}>
                {code}
                {code === definitions.helplineLanguage ? ' (this helpline)' : ''}
              </option>
            ))}
          </select>
        </label>
        {saveResult === 'saved' && <span className="flex-preview-ok">Aselo would save this contact.</span>}
        {saveResult === 'invalid' && (
          <span className="flex-preview-invalid">
            Aselo wouldn't save it yet: check the tabs marked in red.
          </span>
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
          {definitions.logoUrl ? (
            <img className="flex-logo" src={definitions.logoUrl} alt="Helpline logo" />
          ) : (
            <span className="flex-wordmark">Aselo</span>
          )}
          <span className="flex-preview-label">(preview)</span>
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
              <span
                key={label}
                className={active ? 'flex-sidenav-link active' : 'flex-sidenav-link'}
                title={label}
              >
                <Icon />
              </span>
            ))}
          </nav>

          <ContactsWaiting channel={channel} queueName={helplineName(definitions, files)} />

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
              {channel === 'chat' ? <ChatCanvas files={files} language={language} /> : <CallCanvas />}
            </section>

            <div
              className="flex-separator"
              role="separator"
              aria-orientation="vertical"
              aria-label="Drag to resize"
              onPointerDown={startDrag}
            />

            <section className="flex-panel flex-crm" aria-label="Contact form">
              <AseloContactPanel
                key={callType}
                files={files}
                strings={strings}
                callType={callType}
                initialTab={initialTab}
                onSaveResult={setSaveResult}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
