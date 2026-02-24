/**
 * Copyright (C) 2021-2023 Technology Matters
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

/* eslint-disable react/require-default-props */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@twilio-paste/core/button';
import { CloseIcon } from '@twilio-paste/icons/cjs/CloseIcon';

import { contactBackend, sessionDataHandler } from '../../sessionDataHandler';
import { changeEngagementPhase, updatePreEngagementData } from '../../store/actions/genericActions';
import { EngagementPhase } from '../../store/definitions';
import { selectConfig } from '../../store/config.reducer';
import LocalizedTemplate from '../../localization/LocalizedTemplate';
import { localizeKey } from '../../localization/localizeKey';

type Props =
  | {
      channelSid: string;
      token: string;
      language?: string;
      action: 'finishTask';
    }
  | {
      action: 'restartEngagement';
    };

export default function EndChat(props: Props) {
  const [disabled, setDisabled] = useState(false);
  const dispatch = useDispatch();
  const config = useSelector(selectConfig);

  if (!config) {
    return null;
  }

  const configuredBackend = contactBackend(config);
  const configuredLocalizeKey = localizeKey(config.translations[config.currentLocale ?? config.defaultLocale]);
  // Serverless call to end chat
  const handleEndChat = async () => {
    switch (props.action) {
      case 'finishTask':
        if (confirm(configuredLocalizeKey('Header-CloseChatButtons-EndChatConfirmDialogMessageFromChat'))) {
          try {
            const { token, channelSid, language } = props;
            setDisabled(true);
            await configuredBackend('/endChat', { channelSid, token, language });
            sessionDataHandler.clear();
            dispatch(updatePreEngagementData({}));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
          } catch (error) {
            console.error(error);
          } finally {
            setDisabled(false);
          }
        }
        return;
      case 'restartEngagement':
      default:
        if (confirm(configuredLocalizeKey('Header-CloseChatButtons-EndChatConfirmDialogMessageFromPreEngagement'))) {
          sessionDataHandler.clear();
          dispatch(updatePreEngagementData({}));
          dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    }
  };

  return (
    <Button variant="destructive_secondary" element="CHAT_CLOSE_BUTTON" onClick={handleEndChat} disabled={disabled}>
      <CloseIcon decorative={true} />
      <LocalizedTemplate code="Header-CloseChatButtons-EndChatButtonLabel" />
    </Button>
  );
}
