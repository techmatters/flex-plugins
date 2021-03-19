/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import type { DefinitionVersion } from '../common/forms/types';
import { Box, Container, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase, routingBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import * as RoutingActions from '../../states/routing/actions';
import { CaseLayout } from '../../styles/case';
import ActionHeader from './ActionHeader';
import SectionEntry from '../SectionEntry';
import { StandaloneITask } from '../StandaloneSearch';
import { formatName } from '../../utils';
import type { CustomITask } from '../../types/types';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
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

const ViewNote: React.FC<Props> = ({ tempInfo, onClickClose, counselorsHash, definitionVersion }) => {
  if (!tempInfo || tempInfo.screen !== 'view-note') return null;

  const { counselor, date, note } = tempInfo.info;
  const counselorName = formatName(counselorsHash[counselor]);
  const added = new Date(date);

  return (
    <CaseLayout>
      <Container>
        <ActionHeader titleTemplate="Case-Note" onClickClose={onClickClose} counselor={counselorName} added={added} />
        <Box paddingTop="10px">
          <>
            {definitionVersion.caseForms.NoteForm.map(e => (
              <SectionEntry
                key={`entry-${e.label}`}
                description={<Template code={e.label} />}
                value={note}
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

ViewNote.displayName = 'ViewNote';

export const UnconnectedViewNote = ViewNote;
export default connect(mapStateToProps, mapDispatchToProps)(ViewNote);
