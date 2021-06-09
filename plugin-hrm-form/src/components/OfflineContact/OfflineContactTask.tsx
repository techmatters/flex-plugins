/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import {
  namespace,
  RootState,
  routingBase,
  contactFormsBase,
} from '../../states';
import { offlineContactTaskSid } from '../../types/types';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';
import {
  OfflineContactTaskContent,
  OfflineContactTaskFirstLine,
  OfflineContactTaskSecondLine,
  OfflineContactTaskIconContainer,
  OfflineContactTaskIcon,
  OfflineContactTaskButton,
  Box,
  HeaderContainer,
} from '../../styles/HrmStyles';

type OwnProps = { selectedTaskSid: string };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactTask: React.FC<Props> = ({
  isAddingOfflineContact,
  selectedTaskSid,
  offlineContactTask,
}) => {
  if (!isAddingOfflineContact) return null;

  const onClick = async () => {
    await Actions.invokeAction('SelectTask', { task: undefined });
  };

  const selected = !selectedTaskSid && isAddingOfflineContact;
  const name =
    offlineContactTask &&
    `${offlineContactTask.childInformation.firstName} ${offlineContactTask.childInformation.lastName}`;
  const formattedName =
    name && name.trim() !== '' ? name : <Template code="Anonymous" />;

  return (
    <>
      <HeaderContainer>
        <Box
          marginTop="12px"
          marginRight="5px"
          marginBottom="12px"
          marginLeft={TLHPaddingLeft}
        >
          <Template code="OfflineContacts-Header" />
        </Box>
      </HeaderContainer>
      <OfflineContactTaskButton onClick={onClick} selected={selected}>
        <OfflineContactTaskIconContainer>
          <OfflineContactTaskIcon />
        </OfflineContactTaskIconContainer>
        <OfflineContactTaskContent>
          <OfflineContactTaskFirstLine>
            {formattedName}
          </OfflineContactTaskFirstLine>
          <OfflineContactTaskSecondLine>
            <Template code="OfflineContactSecondLine" />
          </OfflineContactTaskSecondLine>
        </OfflineContactTaskContent>
      </OfflineContactTaskButton>
    </>
  );
};

OfflineContactTask.displayName = 'OfflineContactTask';

const mapStateToProps = (state: RootState) => ({
  isAddingOfflineContact: state[namespace][routingBase].isAddingOfflineContact,
  offlineContactTask:
    state[namespace][contactFormsBase].tasks[offlineContactTaskSid],
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(OfflineContactTask);
