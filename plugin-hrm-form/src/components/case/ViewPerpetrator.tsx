/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';

import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase } from '../../states';
import { CaseState } from '../../states/case/reducer';
import { CallerSection } from '../common/ContactDetails';
import ActionHeader from './ActionHeader';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];

  return { counselorsHash, temporaryCaseInfo };
};

type OwnProps = {
  task: ITask;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ViewPerpetrator: React.FC<Props> = ({ counselorsHash, temporaryCaseInfo, onClickClose }) => {
  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'view-perpetrator') return null;

  const counselorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-ViewPerpetrator"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <Box paddingTop="10px">
          <CallerSection
            expanded
            hideIcon
            handleExpandClick={() => undefined}
            values={temporaryCaseInfo.info.perpetrator}
            sectionTitleTemplate="Case-ViewPerpetratorTitle"
          />
        </Box>
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseLayout>
  );
};

ViewPerpetrator.displayName = 'ViewPerpetrator';

export default connect(mapStateToProps, null)(ViewPerpetrator);
