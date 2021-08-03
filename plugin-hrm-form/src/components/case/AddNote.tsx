/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { useForm, FormProvider } from 'react-hook-form';

import ActionHeader from './ActionHeader';
import {
  Box,
  StyledNextStepButton,
  BottomButtonBar,
  BottomButtonBarHeight,
  ColumnarBlock,
  TwoColumnLayout,
  Container,
} from '../../styles/HrmStyles';
import { CaseActionFormContainer, CaseActionLayout } from '../../styles/case';
import { namespace, connectedCaseBase, routingBase, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import { updateCase } from '../../services/CaseService';
import { createFormFromDefinition, disperseInputs, splitInHalf } from '../common/forms/formGenerators';
import type { DefinitionVersion } from '../common/forms/types';
import { transformValues } from '../../services/ContactService';
import type { CustomITask, StandaloneITask } from '../../types/types';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddNote: React.FC<Props> = ({
  task,
  counselor,
  connectedCaseState,
  definitionVersion,
  onClickClose,
  updateTempInfo,
  setConnectedCase,
}) => {
  const { connectedCase, temporaryCaseInfo } = connectedCaseState;
  const { NoteForm } = definitionVersion.caseForms;

  const init = temporaryCaseInfo && temporaryCaseInfo.screen === 'add-note' ? temporaryCaseInfo.info : {};
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();

  const handleSaveNote = async () => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-note') return;

    const { info, id } = connectedCase;
    const note = Object.values(transformValues(NoteForm)(temporaryCaseInfo.info));
    const notes = info && info.notes ? [...info.notes, ...note] : [...note];
    const newInfo = info ? { ...info, notes } : { notes };
    // @ts-ignore TODO: fix this (bug in backend involved, see createAddNoteActivity in hrm)
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);
    updateTempInfo({ screen: 'add-note', info: null }, task.taskSid);
    onClickClose();
  };

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const note = methods.getValues();
      updateTempInfo({ screen: 'add-note', info: note }, task.taskSid);
    };

    const generatedForm = createFormFromDefinition(NoteForm)([])(initialForm)(updateCallBack);

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [NoteForm, initialForm, methods, task.taskSid, updateTempInfo]);

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-note') return null;

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader titleTemplate="Case-AddNote" onClickClose={onClickClose} counselor={counselor} />
          <Container>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>{l}</ColumnarBlock>
                <ColumnarBlock>{r}</ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>{' '}
        </CaseActionFormContainer>
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton data-testid="Case-AddNoteScreen-SaveNote" roundCorners onClick={handleSaveNote}>
            <Template code="BottomBar-SaveNote" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddNote.displayName = 'AddNote';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];
  const { route } = state[namespace][routingBase].tasks[ownProps.task.taskSid];

  return { connectedCaseState, route };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNote);
