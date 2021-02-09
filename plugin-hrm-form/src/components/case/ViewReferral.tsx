/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { ITask, Template } from '@twilio/flex-ui';

import type { FormDefinition } from '../common/forms/types';
import { Container, Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase, routingBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import * as RoutingActions from '../../states/routing/actions';
import { CaseLayout } from '../../styles/case';
import ActionHeader from './ActionHeader';
import SectionEntry from '../SectionEntry';
import { ReferralForm } from '../../formDefinitions/ZA';
import { StandaloneITask } from '../StandaloneSearch';
import { formatName } from '../../utils';

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
  const counselorName = formatName(counselorsHash[counselor.toString()]);
  const added = new Date(date.toString());

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-Referral"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <Box paddingTop="10px">
          <>
            {(ReferralForm as FormDefinition).map(e => (
              <SectionEntry
                key={`entry-${e.label}`}
                description={<Template code={e.label} />}
                value={referral[e.name]}
                definition={e}
              />
            ))}
          </>
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
