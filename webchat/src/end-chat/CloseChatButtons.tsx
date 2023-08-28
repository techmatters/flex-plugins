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
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-webchat-ui';

import Exit from './QuickExit';
import End from './EndChat';
import { AseloWebchatState } from '../aselo-webchat-state';
import { ButtonsWrapper, ExitDescText } from './end-chat-styles';

const CloseChatButtons = ({ channelSid, token, language, tasksSids }: MapStateToProps) => {
  if (!channelSid || !token) {
    return null;
  }

  const finishTask = Boolean(tasksSids?.length);
  return (
    <>
      <ButtonsWrapper>
        <End
          channelSid={channelSid}
          token={token}
          language={language}
          action={finishTask ? 'finishTask' : 'restartEngagement'}
        />
        <Exit channelSid={channelSid} token={token} language={language} finishTask={finishTask} />
      </ButtonsWrapper>
      <ExitDescText>
        <Template code="QuickExitDescription" />
      </ExitDescText>
    </>
  );
};

type MapStateToProps = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: AseloWebchatState) => {
  const { channelSid, tokenPayload } = state?.flex?.session ?? {};

  return {
    tasksSids: state?.task?.tasksSids,
    channelSid,
    token: tokenPayload?.token,
    language: state?.flex?.config?.language,
  };
};

export default connect(mapStateToProps)(CloseChatButtons);
