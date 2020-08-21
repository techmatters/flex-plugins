/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';

import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseContainer } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase } from '../../states';
import { CallerSection } from '../common/ContactDetails';
import ActionHeader from './ActionHeader';
import { isPerpetratorEntry } from '../../types/types';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const { temporaryCaseInfo } = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];

  return { counselorsHash, temporaryCaseInfo };
};

type OwnProps = {
  task: ITask;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ViewPerpetrator: React.FC<Props> = ({ counselorsHash, temporaryCaseInfo, onClickClose }) => {
  if (!isPerpetratorEntry(temporaryCaseInfo)) return null;

  const counselorName = counselorsHash[temporaryCaseInfo.twilioWorkerId] || 'Unknown';
  const date = new Date(temporaryCaseInfo.createdAt).toLocaleDateString(navigator.language);

  return (
    <CaseContainer>
      <Container>
        <ActionHeader
          titleTemplate="Case-ViewPerpetrator"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={date}
        />
        <Box paddingTop="10px">
          <CallerSection
            expanded
            hideIcon
            handleExpandClick={() => undefined}
            values={temporaryCaseInfo.perpetrator}
            sectionTitleTemplate="Case-ViewPerpetratorTitle"
          />
        </Box>
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

ViewPerpetrator.displayName = 'ViewPerpetrator';

export default connect(mapStateToProps, null)(ViewPerpetrator);
