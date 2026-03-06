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

import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@twilio-paste/core/button';
import { LogOutIcon } from '@twilio-paste/icons/cjs/LogOutIcon';

import { contactBackend, sessionDataHandler } from '../../sessionDataHandler';
import { changeEngagementPhase, updatePreEngagementData } from '../../store/actions/genericActions';
import { EngagementPhase } from '../../store/definitions';
import { selectConfig } from '../../store/config.reducer';
import LocalizedTemplate from '../../localization/LocalizedTemplate';

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

export default function QuickExit(props: Props) {
  const dispatch = useDispatch();
  const config = useSelector(selectConfig);

  if (!config) {
    return null;
  }

  const configuredBackend = contactBackend(config);
  const handleExit = async () => {
    // Clear chat history and open a new location
    sessionDataHandler.clear();
    dispatch(updatePreEngagementData({}));
    dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    if (props.action === 'finishTask') {
      // Only if we started a task
      try {
        // Fire and forget end chat request, don't delay blanking the page waiting for the response
        configuredBackend('/endChat', props).then(() => null);
      } catch (error) {
        // Only errors synchronously making the request will be caught, not errors from the service
        console.error(error);
      }
    }
    window.location.replace(config.quickExitUrl);
  };

  return (
    <Button variant="destructive" element="CHAT_CLOSE_BUTTON" onClick={handleExit}>
      <LocalizedTemplate code="Header-CloseChatButtons-QuickExitButtonLabel" /> <LogOutIcon decorative={true} />
    </Button>
  );
}
