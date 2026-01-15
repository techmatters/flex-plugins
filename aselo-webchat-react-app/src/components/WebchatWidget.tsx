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

import { useDispatch, useSelector } from 'react-redux';
import { CustomizationProvider, CustomizationProviderProps } from '@twilio-paste/core/customization';
import { CSSProperties, FC, useEffect } from 'react';

import { RootContainer } from './RootContainer';
import { AppState, EngagementPhase } from '../store/definitions';
import { sessionDataHandler } from '../sessionDataHandler';
import { initSession } from '../store/actions/initActions';
import { changeEngagementPhase } from '../store/actions/genericActions';

const AnyCustomizationProvider: FC<CustomizationProviderProps & { style: CSSProperties }> = CustomizationProvider;

export function WebchatWidget() {
  const theme = useSelector((state: AppState) => state.config.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    const data = sessionDataHandler.tryResumeExistingSession();
    const logger = window.Twilio.getLogger('WebChatWidget');
    if (data && data.token && data.conversationSid) {
      try {
        logger.info('Initializing session.');
        dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
      } catch (e) {
        logger.error('Something wrong with the store token or conversation_sid. Changing engagement phase.');
        dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
      }
    } else {
      // if no token is stored, got engagement form
      logger.warn('Found no token. Going to Engagement form.');
      dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    }
  }, [dispatch]);

  return (
    <AnyCustomizationProvider
      baseTheme={theme?.isLight ? 'default' : 'dark'}
      theme={theme?.overrides}
      elements={{
        MESSAGE_INPUT: {
          boxShadow: 'none!important' as 'none',
        },
        MESSAGE_INPUT_BOX: {
          display: 'inline-block',
          boxShadow: 'none',
        },
        ALERT: {
          paddingTop: 'space30',
          paddingBottom: 'space30',
        },
        BUTTON: {
          "&[aria-disabled='true'][color='colorTextLink']": {
            color: 'colorTextLinkWeak',
          },
        },
      }}
      style={{ minHeight: '100%', minWidth: '100%' }}
    >
      <RootContainer />
    </AnyCustomizationProvider>
  );
}
