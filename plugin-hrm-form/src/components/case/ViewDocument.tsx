/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import SectionEntry from '../SectionEntry';
import ActionHeader from './ActionHeader';
import type { DefinitionVersion } from '../common/forms/types';
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

const ViewDocument: React.FC<Props> = ({ counselorsHash, temporaryCaseInfo, onClickClose, definitionVersion }) => {
  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'view-document') return null;

  const counselorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);

  const { document } = temporaryCaseInfo.info;

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-ViewDocument"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <Box paddingTop="10px">
          <>
            {definitionVersion.caseForms.DocumentForm.map(e => (
              <SectionEntry
                key={`entry-${e.label}`}
                description={<Template code={e.label} />}
                value={document[e.name]}
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

ViewDocument.displayName = 'ViewDocument';

export default connect(mapStateToProps, null)(ViewDocument);
