/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import { DefinitionVersion, FormDefinition, FormInputType } from 'hrm-form-definitions';
import { isEqual } from 'lodash';
import { AnyAction, bindActionCreators } from 'redux';

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
import { RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { newGoBackAction } from '../../states/routing/actions';
import type { Case, CustomITask, StandaloneITask } from '../../types/types';
import { recordingErrorHandler } from '../../fullStory';
import { caseItemHistory, CaseSummaryWorkingCopy } from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import {
  initialiseCaseSummaryWorkingCopy,
  removeCaseSummaryWorkingCopy,
  updateCaseSummaryWorkingCopy,
} from '../../states/case/caseWorkingCopy';
import { PermissionActions, PermissionActionType } from '../../permissions';
import { disperseInputs, splitAt } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import { getTemplateStrings } from '../../hrmConfig';
import { updateCaseAsyncAction } from '../../states/case/saveCase';
import asyncDispatch from '../../states/asyncDispatch';
import { configurationBase, connectedCaseBase, namespace } from '../../states/storeNamespaces';

export type EditCaseSummaryProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  can: (action: PermissionActionType) => boolean;
};
// eslint-disable-next-line no-use-before-define
type Props = EditCaseSummaryProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const EditCaseSummary: React.FC<Props> = ({
  task,
  counselorsHash,
  connectedCaseState,
  workingCopy,
  initialiseWorkingCopy,
  updateWorkingCopy,
  closeActions,
  can,
  updateCaseAsyncAction,
}) => {
  const formDefinition: FormDefinition = useMemo(() => {
    try {
      return [
        {
          name: 'status',
          label: 'Case-CaseStatus',
          type: FormInputType.Select,
          options: connectedCaseState.availableStatusTransitions,
        },
        {
          name: 'followUpDate',
          type: FormInputType.DateInput,
          label: 'Case-CaseDetailsFollowUpDate',
        },
        {
          name: 'childIsAtRisk',
          label: 'Case-ChildIsAtRisk',
          type: FormInputType.Checkbox,
        },
        {
          name: 'summary',
          label: 'SectionName-CaseSummary',
          type: FormInputType.Textarea,
        },
      ];
    } catch (e) {
      console.error('Failed to render edit case summary form', e);
      return [];
    }
  }, [connectedCaseState.availableStatusTransitions]);

  const savedForm = React.useMemo(() => {
    const {
      status,
      info: { summary, followUpDate, childIsAtRisk },
    } = connectedCaseState.connectedCase;
    return {
      status,
      summary: summary ?? '',
      followUpDate: followUpDate ?? '',
      childIsAtRisk: childIsAtRisk ?? false,
    };
  }, [connectedCaseState.connectedCase]);

  const methods = useForm();
  const [openDialog, setOpenDialog] = React.useState(false);

  const { getValues } = methods;

  useEffect(() => {
    if (!workingCopy) {
      initialiseWorkingCopy(task.taskSid, getValues() as CaseSummaryWorkingCopy);
    }
  });

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: workingCopy,
    parentsPath: '',
    updateCallback: () => updateWorkingCopy(task.taskSid, getValues() as CaseSummaryWorkingCopy),
    isItemEnabled: item => {
      switch (item.name) {
        case 'childIsAtRisk':
          return can(PermissionActions.EDIT_CHILD_IS_AT_RISK);
        case 'summary':
          return can(PermissionActions.EDIT_CASE_SUMMARY);
        case 'followUpDate':
          return can(PermissionActions.EDIT_FOLLOW_UP_DATE);
        default:
          return true;
      }
    },
  });

  const [l, r] = React.useMemo(() => {
    return splitAt(3)(disperseInputs(7)(form));
  }, [form]);

  const save = async () => {
    const { info, id } = connectedCaseState.connectedCase;
    const { status, ...updatedInfoValues } = workingCopy;

    await updateCaseAsyncAction(id, {
      status,
      info: { ...info, ...updatedInfoValues },
    });
  };

  const saveAndLeave = async () => {
    await save();
    closeActions();
  };

  const strings = getTemplateStrings();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(`Case: EditCaseSummary`, () => {
    window.alert(strings['Error-Form']);
    if (openDialog) setOpenDialog(false);
  });

  const { added, addingCounsellorName, updated, updatingCounsellorName } = caseItemHistory(
    connectedCaseState.connectedCase,
    counselorsHash,
  );

  const checkForEdits = () => {
    if (isEqual(workingCopy, savedForm)) {
      closeActions();
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
            updatingCounsellor={updatingCounsellorName}
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
            <StyledNextStepButton data-testid="Case-CloseButton" secondary="true" roundCorners onClick={checkForEdits}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
            <CloseCaseDialog
              data-testid="CloseCaseDialog"
              openDialog={openDialog}
              setDialog={() => setOpenDialog(false)}
              handleDontSaveClose={() => closeActions()}
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
  const updateCaseAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    initialiseWorkingCopy: bindActionCreators(initialiseCaseSummaryWorkingCopy, dispatch),
    updateWorkingCopy: bindActionCreators(updateCaseSummaryWorkingCopy, dispatch),
    closeActions: () => {
      dispatch(removeCaseSummaryWorkingCopy(task.taskSid));
      dispatch(newGoBackAction(task.taskSid));
    },
    updateCaseAsyncAction: (caseId: Case['id'], body: Partial<Case>) =>
      updateCaseAsyncDispatch(updateCaseAsyncAction(caseId, task.taskSid, body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditCaseSummary);
