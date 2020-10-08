/* eslint-disable react/prop-types */
import React from 'react';
import { ButtonBase } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import type { QueuesStatusState } from '../../states/queuesStatus/reducer';
import { namespace, queuesStatusBase } from '../../states';
import { isAnyChatPending } from '../queuesStatus/helpers';
import { ManualPullIconContainer, ManualPullIcon, ManualPullContent, ManualPullText } from '../../styles/HrmStyles';
import { adjustChatCapacity } from '../../services/ServerlessService';

const increaseChatCapacity = async () => {
  await adjustChatCapacity('increase');
};

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ManualPullButton: React.FC<Props> = ({ queuesStatusState }) => {
  const disabled = !isAnyChatPending(queuesStatusState.queuesStatus);

  return (
    <ButtonBase
      onClick={increaseChatCapacity}
      className="Twilio-TaskListBaseItem-UpperArea css-xz5ie1"
      disabled={disabled}
    >
      <ManualPullIconContainer>
        <ManualPullIcon icon="Add" />
      </ManualPullIconContainer>
      <ManualPullContent>
        <ManualPullText>
          <Template code="ManualPullButtonText" />
        </ManualPullText>
      </ManualPullContent>
    </ButtonBase>
  );
};

ManualPullButton.displayName = 'ManualPullButton';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const queuesStatusState: QueuesStatusState = state[namespace][queuesStatusBase]; // casting type as inference is not working for the store yet

  return { queuesStatusState };
};

export default connect(mapStateToProps, null)(ManualPullButton);
