/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { format, parseISO } from 'date-fns';

import { Container, Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase, routingBase } from '../../states';
import { CaseState } from '../../states/case/reducer';
import * as RoutingActions from '../../states/routing/actions';
import { CaseContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import SectionEntry from '../SectionEntry';

type OwnProps = {
  taskSid: string;
};

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const { route } = state[namespace][routingBase].tasks[ownProps.taskSid];

  return { tempInfo: temporaryCaseInfo, counselorsHash, route };
};

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewReferral: React.FC<Props> = ({ taskSid, tempInfo, route, changeRoute, counselorsHash }) => {
  if (!tempInfo || tempInfo.screen !== 'view-referral') return null;

  const { counselor, date, referral } = tempInfo.info;
  const counselorName = counselorsHash[counselor] || 'Unknown';
  const added = new Date(date);
  const referralDate = `${format(parseISO(referral.date), 'MMM d, yyyy')}`;

  const handleClose = () => changeRoute({ route }, taskSid);

  return (
    <CaseContainer>
      <Container>
        <ActionHeader
          titleTemplate="Case-Referral"
          onClickClose={handleClose}
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
        <StyledNextStepButton roundCorners onClick={handleClose} data-testid="Case-ViewNoteScreen-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

ViewReferral.displayName = 'ViewReferral';

export const UnconnectedViewReferral = ViewReferral;
export default connect(mapStateToProps, mapDispatchToProps)(ViewReferral);
