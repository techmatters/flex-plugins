/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';

import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import SectionEntry from '../SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];

  return { counselorsHash, temporaryCaseInfo };
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ViewHousehold: React.FC<Props> = ({ counselorsHash, temporaryCaseInfo, onClickClose, definitionVersion }) => {
  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'view-household') return null;

  const counselorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);

  const { household } = temporaryCaseInfo.info;

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-ViewHousehold"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <Box paddingTop="10px">
          <>
            {definitionVersion.caseForms.HouseholdForm.map(e => (
              <SectionEntry
                key={`entry-${e.label}`}
                description={<Template code={e.label} />}
                value={household[e.name]}
                definition={e}
              />
            ))}
          </>
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

ViewHousehold.displayName = 'ViewHousehold';

export default connect(mapStateToProps, null)(ViewHousehold);
