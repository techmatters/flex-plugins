/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { ITask, Template } from '@twilio/flex-ui';
import { format, parseISO } from 'date-fns';

import { Container, Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase, routingBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import * as RoutingActions from '../../states/routing/actions';
import { CaseLayout } from '../../styles/case';
import ActionHeader from './ActionHeader';
import SectionEntry from '../SectionEntry';
import { StandaloneITask } from '../StandaloneSearch';

type OwnProps = {
  task: ITask | StandaloneITask;
  onClickClose: () => void;
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const { route } = state[namespace][routingBase].tasks[ownProps.task.taskSid];

  return { tempInfo: temporaryCaseInfo, counselorsHash, route };
};

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewReferral: React.FC<Props> = ({ onClickClose, tempInfo, counselorsHash }) => {
  if (!tempInfo || tempInfo.screen !== 'view-referral') return null;

  const { counselor, date, referral } = tempInfo.info;
  const counselorName = counselorsHash[counselor] || 'Unknown';
  const added = new Date(date);
  const referralDate = `${format(parseISO(referral.date), 'MMM d, yyyy')}`;

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-Referral"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <Box marginTop="10px">
          <SectionEntry description={<Template code="Case-ReferralDate" />} value={referralDate} />
          <SectionEntry description={<Template code="Case-ReferralReferredTo" />} value={referral.referredTo} />
          <SectionEntry notBold description={<Template code="Case-ReferralComments" />} value={referral.comments} />
        </Box>
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-ViewNoteScreen-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseLayout>
  );
};

ViewReferral.displayName = 'ViewReferral';

export const UnconnectedViewReferral = ViewReferral;
export default connect(mapStateToProps, mapDispatchToProps)(ViewReferral);
