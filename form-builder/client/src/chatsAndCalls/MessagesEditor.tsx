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
 * post-chat survey). How they're written lives in messagesSlice.ts.
 */
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { getHelplineName } from '../common/definitions';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectWorkspace } from '../workspace/workspaceSlice';
import { CHAT_MESSAGES, getMessages, LocalizedMessages, POST_SURVEY_MESSAGES } from './sections';
import {
  addLanguage,
  ALL_LANGUAGES,
  getMessageLanguages,
  getSurveyMessages,
  languageSelected,
  newLanguageChanged,
  openMessages,
  selectMessages,
  setChatMessage,
  setSurveyMessage,
} from './messagesSlice';
import '../aseloPreview/flexDesktop.css';

// Built-in fallbacks: lambdas/account-scoped/src/operatingHours.ts and translations/en.json
const DEFAULT_MESSAGES: Record<string, string> = {
  ClosedOutOfShift: 'The helpline is out of shift, please reach us later.',
  ClosedHolidays: 'The helpline is closed due to a holiday.',
  triggerMessage:
    'Before you leave, would you be willing to answer a few questions about the service you received today? Please answer Yes or No.',
};

export const MessagesEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const { code, editorRevision } = useAppSelector(selectWorkspace);
  const { language, newLanguage } = useAppSelector(selectMessages);
  const helplineName = getHelplineName(draftFiles, code);
  const chatMessages = getMessages(draftFiles);
  const { surveyIsFlat, surveyMessages } = getSurveyMessages(draftFiles);
  const languages = getMessageLanguages(draftFiles);
  const surveyLanguage = surveyIsFlat ? ALL_LANGUAGES : language;

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openMessages());
  }, [dispatch, editorRevision]);

  const otherChatKeys = Object.keys(chatMessages[language] ?? {}).filter(
    key => !CHAT_MESSAGES.some(info => info.key === key),
  );
  const otherSurveyKeys = Object.keys(surveyMessages[surveyLanguage] ?? {}).filter(
    key => !POST_SURVEY_MESSAGES.some(info => info.key === key),
  );

  const messageCard = (key: string, title: string, when: string, value: string, onChange: (text: string) => void) => (
    <div key={key} className="message-card">
      <span className="field-label">{title}</span>
      <span className="field-hint">{when}</span>
      <textarea
        rows={3}
        value={value}
        aria-label={title}
        placeholder={DEFAULT_MESSAGES[key] ? `Default: ${DEFAULT_MESSAGES[key]}` : ''}
        onChange={e => onChange(e.target.value)}
      />
      {DEFAULT_MESSAGES[key] && !value && (
        <span className="field-hint">Empty, so Aselo&apos;s default (shown above) is sent.</span>
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
            {languages.map(languageCode => (
              <button
                key={languageCode}
                type="button"
                role="tab"
                aria-selected={languageCode === language}
                className={languageCode === language ? 'active' : ''}
                onClick={() => dispatch(languageSelected(languageCode))}
              >
                {languageCode}
              </button>
            ))}
            <form
              className="language-add"
              onSubmit={e => {
                e.preventDefault();
                dispatch(addLanguage());
              }}
            >
              <input
                type="text"
                value={newLanguage}
                placeholder="Add a language (e.g. es)"
                aria-label="Language code to add"
                onChange={e => dispatch(newLanguageChanged(e.target.value))}
              />
            </form>
          </div>

          <h3 className="section-heading">During the chat</h3>
          {CHAT_MESSAGES.map(info =>
            messageCard(info.key, info.title, info.when, chatMessages[language]?.[info.key] ?? '', text =>
              dispatch(setChatMessage(info.key, text)),
            ),
          )}
          {otherChatKeys.map(key =>
            messageCard(key, key, 'A message specific to this helpline.', chatMessages[language]?.[key] ?? '', text =>
              dispatch(setChatMessage(key, text)),
            ),
          )}

          <h3 className="section-heading">Post-chat survey</h3>
          {surveyIsFlat && (
            <p className="field-hint">This helpline uses the same survey messages for every language.</p>
          )}
          {POST_SURVEY_MESSAGES.map(info =>
            messageCard(
              `survey-${info.key}`,
              info.title,
              info.when,
              surveyMessages[surveyLanguage]?.[info.key] ?? '',
              text => dispatch(setSurveyMessage(info.key, text)),
            ),
          )}
          {otherSurveyKeys.map(key =>
            messageCard(
              `survey-${key}`,
              key,
              key === 'postSurvetCompleteMessage'
                ? 'This looks like a misspelling of postSurveyCompleteMessage, so it may never be used.'
                : 'A survey message specific to this helpline.',
              surveyMessages[surveyLanguage]?.[key] ?? '',
              text => dispatch(setSurveyMessage(key, text)),
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
                ? shown(
                    entry.key,
                    entry.survey ? surveyMessages : chatMessages,
                    entry.survey ? surveyLanguage : language,
                  )
                : entry.text;
              if (!text) return null;
              const isContact = entry.from === 'contact';
              const counselorName = entry.from === 'helpline' ? helplineName : 'Counselor';
              return (
                <div
                  key={index}
                  className={`flex-message ${isContact ? 'flex-message-contact' : 'flex-message-counselor'}`}
                >
                  <div className="flex-message-meta">
                    <strong>{isContact ? 'Contact' : counselorName}</strong>
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
