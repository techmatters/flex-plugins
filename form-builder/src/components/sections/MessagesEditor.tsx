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
 * Edits the messages Aselo sends automatically in chats: customStrings/Messages.json (sent by
 * the plugin and lambdas/account-scoped) and customStrings/postSurveyMessages.json (the
 * post-chat survey). Both are grouped by language; the post-survey file can also be flat
 * (one set for every language), and keeps whichever shape the helpline already uses.
 */
import { useState } from 'react';
import type { DefinitionFileMap } from '../../definitions';
import {
  CHAT_MESSAGES,
  getMessages,
  isFlatMessages,
  LocalizedMessages,
  MESSAGES_FILE,
  POST_SURVEY_MESSAGES,
  POST_SURVEY_MESSAGES_FILE,
} from '../../sections';
import '../../aselo/flexDesktop.css';

// Built-in fallbacks: lambdas/account-scoped/src/operatingHours.ts and translations/en.json
const DEFAULT_MESSAGES: Record<string, string> = {
  ClosedOutOfShift: 'The helpline is out of shift, please reach us later.',
  ClosedHolidays: 'The helpline is closed due to a holiday.',
  triggerMessage:
    'Before you leave, would you be willing to answer a few questions about the service you received today? Please answer Yes or No.',
};

const ALL_LANGUAGES = '(all languages)';

type Props = {
  draftFiles: DefinitionFileMap;
  helplineName: string;
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

// Sets or removes (when empty) one message, keeping the file's shape
const withMessage = (
  file: unknown,
  language: string,
  key: string,
  text: string,
): Record<string, unknown> => {
  if (language === ALL_LANGUAGES) {
    const flat = { ...((file ?? {}) as Record<string, string>) };
    if (text) flat[key] = text;
    else delete flat[key];
    return flat;
  }
  const localized = { ...((file ?? {}) as LocalizedMessages) };
  const messages = { ...(localized[language] ?? {}) };
  if (text) messages[key] = text;
  else delete messages[key];
  localized[language] = messages;
  return localized;
};

export const MessagesEditor = ({ draftFiles, helplineName, onChangeFiles }: Props) => {
  const chatMessages = getMessages(draftFiles);
  const surveyFile = draftFiles[POST_SURVEY_MESSAGES_FILE];
  const surveyIsFlat = isFlatMessages(surveyFile);
  const surveyMessages: LocalizedMessages = surveyIsFlat
    ? { [ALL_LANGUAGES]: surveyFile as Record<string, string> }
    : ((surveyFile ?? {}) as LocalizedMessages);

  const languages = [
    ...new Set([...Object.keys(chatMessages), ...Object.keys(surveyMessages)].filter(
      (language) => language !== ALL_LANGUAGES,
    )),
  ];
  const [language, setLanguage] = useState(languages[0] ?? 'en');
  const [newLanguage, setNewLanguage] = useState('');

  const setChatMessage = (key: string, text: string) =>
    onChangeFiles((files) => ({
      ...files,
      [MESSAGES_FILE]: withMessage(files[MESSAGES_FILE], language, key, text),
    }));

  const surveyLanguage = surveyIsFlat ? ALL_LANGUAGES : language;
  const setSurveyMessage = (key: string, text: string) =>
    onChangeFiles((files) => ({
      ...files,
      [POST_SURVEY_MESSAGES_FILE]: withMessage(files[POST_SURVEY_MESSAGES_FILE], surveyLanguage, key, text),
    }));

  const otherChatKeys = Object.keys(chatMessages[language] ?? {}).filter(
    (key) => !CHAT_MESSAGES.some((info) => info.key === key),
  );
  const otherSurveyKeys = Object.keys(surveyMessages[surveyLanguage] ?? {}).filter(
    (key) => !POST_SURVEY_MESSAGES.some((info) => info.key === key),
  );

  const messageCard = (
    key: string,
    title: string,
    when: string,
    value: string,
    onChange: (text: string) => void,
  ) => (
    <div key={key} className="message-card">
      <span className="field-label">{title}</span>
      <span className="field-hint">{when}</span>
      <textarea
        rows={3}
        value={value}
        aria-label={title}
        placeholder={DEFAULT_MESSAGES[key] ? `Default: ${DEFAULT_MESSAGES[key]}` : ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {DEFAULT_MESSAGES[key] && !value && (
        <span className="field-hint">Empty, so Aselo's default (shown above) is sent.</span>
      )}
    </div>
  );

  const shown = (key: string, messages: LocalizedMessages, lang: string) =>
    messages[lang]?.[key] || DEFAULT_MESSAGES[key];

  // The order messages appear in a conversation, for the preview
  const previewTimeline = [
    { from: 'contact', text: 'Hi, I would like to talk to someone.' },
    { from: 'helpline', key: 'WelcomeMsg' },
    { from: 'counselor', text: "Hi, thanks for reaching out. I'm here to listen." },
    { from: 'helpline', key: 'GoodbyeMsg' },
    { from: 'helpline', key: 'triggerMessage', survey: true },
  ];

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Automatic chat messages</h2>
          <p className="muted">Messages Aselo sends to the contact by itself, in each language.</p>

          <div className="language-tabs" role="tablist" aria-label="Language">
            {languages.map((code) => (
              <button
                key={code}
                type="button"
                role="tab"
                aria-selected={code === language}
                className={code === language ? 'active' : ''}
                onClick={() => setLanguage(code)}
              >
                {code}
              </button>
            ))}
            <form
              className="language-add"
              onSubmit={(e) => {
                e.preventDefault();
                const code = newLanguage.trim();
                if (code) {
                  setLanguage(code);
                  setNewLanguage('');
                }
              }}
            >
              <input
                type="text"
                value={newLanguage}
                placeholder="Add a language (e.g. es)"
                aria-label="Language code to add"
                onChange={(e) => setNewLanguage(e.target.value)}
              />
            </form>
          </div>

          <h3 className="section-heading">During the chat</h3>
          {CHAT_MESSAGES.map((info) =>
            messageCard(info.key, info.title, info.when, chatMessages[language]?.[info.key] ?? '', (text) =>
              setChatMessage(info.key, text),
            ),
          )}
          {otherChatKeys.map((key) =>
            messageCard(key, key, 'A message specific to this helpline.', chatMessages[language]?.[key] ?? '', (text) =>
              setChatMessage(key, text),
            ),
          )}

          <h3 className="section-heading">Post-chat survey</h3>
          {surveyIsFlat && (
            <p className="field-hint">
              This helpline uses the same survey messages for every language.
            </p>
          )}
          {POST_SURVEY_MESSAGES.map((info) =>
            messageCard(
              `survey-${info.key}`,
              info.title,
              info.when,
              surveyMessages[surveyLanguage]?.[info.key] ?? '',
              (text) => setSurveyMessage(info.key, text),
            ),
          )}
          {otherSurveyKeys.map((key) =>
            messageCard(
              `survey-${key}`,
              key,
              key === 'postSurvetCompleteMessage'
                ? 'This looks like a misspelling of postSurveyCompleteMessage, so it may never be used.'
                : 'A survey message specific to this helpline.',
              surveyMessages[surveyLanguage]?.[key] ?? '',
              (text) => setSurveyMessage(key, text),
            ),
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">In the conversation ({language})</span>
        </div>
        <div className="section-preview-frame flex-desktop">
          <div className="flex-messages">
            {previewTimeline.map((entry, index) => {
              const text = entry.key
                ? shown(entry.key, entry.survey ? surveyMessages : chatMessages, entry.survey ? surveyLanguage : language)
                : entry.text;
              if (!text) return null;
              const isContact = entry.from === 'contact';
              return (
                <div key={index} className={`flex-message ${isContact ? 'flex-message-contact' : 'flex-message-counselor'}`}>
                  <div className="flex-message-meta">
                    <strong>{isContact ? 'Contact' : entry.from === 'helpline' ? helplineName : 'Counselor'}</strong>
                  </div>
                  <div className="flex-message-bubble">{text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
