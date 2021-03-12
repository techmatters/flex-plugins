/* eslint-disable react/prop-types */
import React from 'react';
import { Actions } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { namespace, RootState, routingBase } from '../../states';
import {
  AddTaskContent,
  OfflineContactTaskIconContainer,
  OfflineContactTaskIcon,
  OfflineContactTaskButton,
} from '../../styles/HrmStyles';

type OwnProps = { selectedTaskSid: string };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactTask: React.FC<Props> = ({ isAddingOfflineContact, selectedTaskSid }) => {
  if (!isAddingOfflineContact) return null;

  const onClick = async () => {
    await Actions.invokeAction('SelectTask', { task: undefined });
  };

  const selected = !selectedTaskSid && isAddingOfflineContact;

  return (
    <OfflineContactTaskButton onClick={onClick} selected={selected}>
      <OfflineContactTaskIconContainer>
        <OfflineContactTaskIcon />
      </OfflineContactTaskIconContainer>
      <AddTaskContent>Offline Contact</AddTaskContent>
    </OfflineContactTaskButton>
  );
};

OfflineContactTask.displayName = 'OfflineContactTask';

const mapStateToProps = (state: RootState) => ({
  isAddingOfflineContact: state[namespace][routingBase].isAddingOfflineContact,
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(OfflineContactTask);
