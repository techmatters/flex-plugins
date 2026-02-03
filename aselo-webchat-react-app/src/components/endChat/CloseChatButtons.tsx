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
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@twilio-paste/core/grid';
import { Column, DetailText } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';

import QuickExit from './QuickExit';
import EndChat from './EndChat';
import LocalizedTemplate from '../../localization/LocalizedTemplate';
import { selectConversation } from '../../store/chat.reducer';
import { selectTaskSids } from '../../task';
import { selectToken } from '../../store/session.reducer';
import { selectCurrentLocale } from '../../store/config.reducer';

const CloseChatButtons = () => {
  const conversation = useSelector(selectConversation);
  const token = useSelector(selectToken);
  const tasksSids = useSelector(selectTaskSids);
  const locale = useSelector(selectCurrentLocale);

  const endChatButton =
    conversation && token && tasksSids?.length ? (
      <EndChat channelSid={conversation.sid} token={token} language={locale} action="finishTask" />
    ) : (
      <EndChat action="restartEngagement" />
    );
  const quickExitButton =
    conversation && token && tasksSids?.length ? (
      <QuickExit channelSid={conversation.sid} token={token} language={locale} action="finishTask" />
    ) : (
      <QuickExit action="restartEngagement" />
    );

  return (
    <Box padding="space30">
      <Grid gutter="space30">
        <Column>{endChatButton}</Column>
        <Column>
          {quickExitButton}
          <DetailText element="URGENT">
            <LocalizedTemplate code="Header-CloseChatButtons-QuickExitDescription" />
          </DetailText>
        </Column>
      </Grid>
    </Box>
  );
};

export default CloseChatButtons;
