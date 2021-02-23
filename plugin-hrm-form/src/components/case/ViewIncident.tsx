/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import type { DefinitionVersion } from '../common/forms/types';
import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseContainer } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase, RootState } from '../../states';
import ActionHeader from './ActionHeader';
import SectionEntry from '../SectionEntry';
import { StandaloneITask } from '../StandaloneSearch';
import type { CustomITask } from '../../types/types';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];

  return { counselorsHash, temporaryCaseInfo };
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ViewIncident: React.FC<Props> = ({ counselorsHash, temporaryCaseInfo, onClickClose, definitionVersion }) => {
  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'view-incident') return null;

  const counselorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);

  const { incident } = temporaryCaseInfo.info;

  return (
    <CaseContainer>
      <Container>
        <ActionHeader
          titleTemplate="Case-ViewIncident"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <Box paddingTop="10px">
          <>
            {definitionVersion.caseForms.IncidentForm.map(e => (
              <SectionEntry
                key={`entry-${e.label}`}
                description={<Template code={e.label} />}
                value={incident[e.name]}
                definition={e}
                layout={definitionVersion.layoutVersion.case.incidents.layout[e.name]}
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
    </CaseContainer>
  );
};

ViewIncident.displayName = 'ViewIncident';

export default connect(mapStateToProps, null)(ViewIncident);
