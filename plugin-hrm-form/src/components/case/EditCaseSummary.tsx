/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import type { DefinitionVersion, FormDefinition, StatusInfo } from 'hrm-form-definitions';
import { isEqual } from 'lodash';
import { bindActionCreators } from 'redux';

import {
  BottomButtonBar,
  BottomButtonBarHeight,
  Box,
  ColumnarBlock,
  Container,
  StyledNextStepButton,
  TwoColumnLayout,
} from '../../styles/HrmStyles';
import { CaseActionFormContainer, CaseActionLayout } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { configurationBase, connectedCaseBase, namespace, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import { createFormFromDefinition, disperseInputs, splitAt } from '../common/forms/formGenerators';
import type { CustomITask, StandaloneITask } from '../../types/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import { caseItemHistory, CaseState, CaseSummaryWorkingCopy } from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import {
  initialiseCaseSummaryWorkingCopy,
  removeCaseSummaryWorkingCopy,
  updateCaseSummaryWorkingCopy,
} from '../../states/case/caseWorkingCopy';
import { changeRoute } from '../../states/routing/actions';
import { AppRoutes } from '../../states/routing/types';

export type EditCaseSummaryProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  exitRoute: AppRoutes;
};
// eslint-disable-next-line no-use-before-define
type Props = EditCaseSummaryProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const EditCaseSummary: React.FC<Props> = ({
  task,
  counselorsHash,
  exitRoute,
  connectedCaseState,
  setConnectedCase,
  definitionVersion,
  workingCopy,
  initialiseWorkingCopy,
  updateWorkingCopy,
  closeActions,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  useEffect(() => {
    if (!workingCopy) {
      initialiseWorkingCopy(task.taskSid);
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const firstElementRef = useFocus();

  const formDefinition: FormDefinition = useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    try {
      let caseStatusOptions = [];
      if (definitionVersion) {
        const caseStatusList = Object.values<StatusInfo>(definitionVersion.caseStatus);
        const currentStatusItem = caseStatusList.find(cs => cs.value === connectedCaseState.connectedCase.status);
        const availableStatusTransitions: string[] = currentStatusItem
          ? [...(currentStatusItem.transitions ?? []), currentStatusItem.value]
          : [];
        caseStatusOptions = caseStatusList.filter(option => availableStatusTransitions.includes(option.value));
      }
      return [
        {
          name: 'status',
          label: 'Case-CaseStatus',
          type: 'select',
          options: caseStatusOptions,
        },
        {
          name: 'followUpDate',
          type: 'date-input',
          label: 'Case-CaseDetailsFollowUpDate',
        },
        {
          name: 'childIsAtRisk',
          label: 'Case-ChildIsAtRisk',
          type: 'checkbox',
        },
        {
          name: 'summary',
          label: 'SectionName-CaseSummary',
          type: 'textarea',
        },
      ];
    } catch (e) {
      console.error('Failed to render edit case summary form', e);
      return [];
    }
  }, [connectedCaseState.connectedCase.status, definitionVersion]);

  const initialForm = React.useMemo(() => {
    const {
      status,
      info: { summary, followUpDate, childIsAtRisk },
    } = connectedCaseState.connectedCase;
    return {
      status,
      summary,
      followUpDate,
      childIsAtRisk,
    };
  }, [connectedCaseState.connectedCase]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const methods = useForm();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [openDialog, setOpenDialog] = React.useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { getValues } = methods;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const formValues = getValues();
      updateWorkingCopy(task.taskSid, formValues as CaseSummaryWorkingCopy);
    };
    const generatedForm = createFormFromDefinition(formDefinition)([])(workingCopy, firstElementRef)(updateCallBack);
    return splitAt(3)(disperseInputs(7)(generatedForm));
  }, [formDefinition, workingCopy, firstElementRef, getValues, updateWorkingCopy, task.taskSid]);

  const save = async () => {
    const { info, id } = connectedCaseState.connectedCase;
    const { status, ...updatedInfoValues } = workingCopy;

    const updatedCase = await updateCase(id, { status, info: { ...info, ...updatedInfoValues } });
    setConnectedCase(updatedCase, task.taskSid);
  };

  const saveAndLeave = async () => {
    await save();
    closeActions(exitRoute);
  };

  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(`Case: EditCaseSummary`, () => {
    window.alert(strings['Error-Form']);
    if (openDialog) setOpenDialog(false);
  });

  const { added, addingCounsellorName, updated } = caseItemHistory(connectedCaseState.connectedCase, counselorsHash);

  const checkForEdits = () => {
    if (isEqual(workingCopy, initialForm)) {
      closeActions(exitRoute);
    } else setOpenDialog(true);
  };

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader
            titleTemplate="Case-EditCaseSummary"
            onClickClose={checkForEdits}
            addingCounsellor={addingCounsellorName}
            added={added}
            updated={updated}
            updatingCounsellor=""
          />
          <Container>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>{l}</ColumnarBlock>
                <ColumnarBlock>{r}</ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>{' '}
        </CaseActionFormContainer>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={checkForEdits}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
            <CloseCaseDialog
              data-testid="CloseCaseDialog"
              openDialog={openDialog}
              setDialog={() => setOpenDialog(false)}
              handleDontSaveClose={() => closeActions(exitRoute)}
              handleSaveUpdate={methods.handleSubmit(saveAndLeave, onError)}
            />
          </Box>
          <StyledNextStepButton
            data-testid="Case-EditCaseScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(saveAndLeave, onError)}
          >
            <Template code="BottomBar-SaveCaseSummary" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

EditCaseSummary.displayName = 'EditCaseSummary';

const mapStateToProps = (state: RootState, ownProps: EditCaseSummaryProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const connectedCaseState = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];
  const workingCopy = connectedCaseState?.caseWorkingCopy.caseSummary;

  return { connectedCaseState, counselorsHash, workingCopy };
};

const mapDispatchToProps = (dispatch, { task }: EditCaseSummaryProps) => {
  return {
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    initialiseWorkingCopy: bindActionCreators(initialiseCaseSummaryWorkingCopy, dispatch),
    updateWorkingCopy: bindActionCreators(updateCaseSummaryWorkingCopy, dispatch),
    closeActions: route => {
      dispatch(removeCaseSummaryWorkingCopy(task.taskSid));
      dispatch(changeRoute(route, task.taskSid));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditCaseSummary);
