/* eslint-disable react/prop-types */
import React from 'react';
import { ButtonBase } from '@material-ui/core';
import { Notifications, Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { configurationBase, namespace, queuesStatusBase, RootState } from '../../states';
import { isAnyChatPending } from '../queuesStatus/helpers';
import { ManualPullIconContainer, ManualPullIcon, ManualPullContent, ManualPullText } from '../../styles/HrmStyles';
import { adjustChatCapacity } from '../../services/ServerlessService';

type OwnProps = {
  workerClient: import('@twilio/flex-ui').Manager['workerClient'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ManualPullButton: React.FC<Props> = ({ queuesStatusState, chatChannelCapacity, workerAttr, workerClient }) => {
  const increaseChatCapacity = async () => {
    let alertTimeout = null;

    const eventHandler = () => {
      console.log('>>>> Reservation created, removing timeout: ', alertTimeout);
      clearTimeout(alertTimeout);
    };

    alertTimeout = setTimeout(async () => {
      workerClient.removeListener('reservationCreated', eventHandler);
      console.log('>>>> Tiemout expired, decreasing capacity!');
      Notifications.showNotification('NoTaskAssignableNotification');
      await adjustChatCapacity('decrease');
    }, 5000);

    workerClient.once('reservationCreated', eventHandler);

    await adjustChatCapacity('increase');
  };

  const maxCapacityReached = chatChannelCapacity === workerAttr.maxMessageCapacity;
  const disabled = maxCapacityReached || !isAnyChatPending(queuesStatusState.queuesStatus);

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

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];
  const { chatChannelCapacity } = state[namespace][configurationBase].workerInfo;
  const { attributes: workerAttr } = state.flex.worker;

  return { queuesStatusState, chatChannelCapacity, workerAttr };
};

export default connect(mapStateToProps, null)(ManualPullButton);
