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
import { FormDefinition, FormInputType } from 'hrm-form-definitions';
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
} from '../../../styles';
import { RootState } from '../../../states';
import * as RoutingActions from '../../../states/routing/actions';
import { newCloseModalAction, newGoBackAction } from '../../../states/routing/actions';
import type { Case, CaseOverview, CustomITask, StandaloneITask } from '../../../types/types';
import { recordingErrorHandler } from '../../../fullStory';
import { CaseSummaryWorkingCopy } from '../../../states/case/types';
import CloseCaseDialog from '../CloseCaseDialog';
import {
  initialiseCaseSummaryWorkingCopy,
  removeCaseSummaryWorkingCopy,
  updateCaseSummaryWorkingCopy,
} from '../../../states/case/caseWorkingCopy';
import { PermissionActions, PermissionActionType } from '../../../permissions';
import { disperseInputs, splitAt } from '../../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../../forms';
import { getTemplateStrings } from '../../../hrmConfig';
import { updateCaseOverviewAsyncAction } from '../../../states/case/saveCase';
import asyncDispatch from '../../../states/asyncDispatch';
import NavigableContainer from '../../NavigableContainer';
import selectCurrentRouteCaseState from '../../../states/case/selectCurrentRouteCase';
import CaseSummaryEditHistory from './CaseOverviewEditHistory';
import { selectDefinitionVersionForCase } from '../../../states/configuration/selectDefinitions';
import { selectCaseHistoryDetails } from '../../../states/case/selectCaseStateByCaseId';

export type EditCaseOverviewProps = {
  task: CustomITask | StandaloneITask;
  can: (action: PermissionActionType) => boolean;
};

const mapStateToProps = (state: RootState, { task }: EditCaseOverviewProps) => {
  const connectedCaseState = selectCurrentRouteCaseState(state, task.taskSid);
  const historyDetails = selectCaseHistoryDetails(state, connectedCaseState?.connectedCase);
  const workingCopy = connectedCaseState?.caseWorkingCopy.caseSummary;
  const isUpdating = (connectedCaseState?.outstandingUpdateCount ?? 0) > 0;
  const definitionVersion = selectDefinitionVersionForCase(state, connectedCaseState?.connectedCase);
  return { connectedCaseState, workingCopy, definitionVersion, historyDetails, isUpdating };
};

const mapDispatchToProps = (dispatch, { task }: EditCaseOverviewProps) => {
  const updateCaseAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    initialiseWorkingCopy: bindActionCreators(initialiseCaseSummaryWorkingCopy, dispatch),
    updateWorkingCopy: bindActionCreators(updateCaseSummaryWorkingCopy, dispatch),
    closeActions: (caseId: string, closeModal: boolean) => {
      dispatch(removeCaseSummaryWorkingCopy(caseId));
      dispatch(closeModal ? newCloseModalAction(task.taskSid) : newGoBackAction(task.taskSid));
    },
    updateCaseAsyncAction: (caseId: Case['id'], overview: CaseOverview, status: Case['status']) =>
      updateCaseAsyncDispatch(updateCaseOverviewAsyncAction(caseId, overview, status)),
  };
};

type Props = EditCaseOverviewProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const enum DialogState {
  Closed,
  OpenForBack,
  OpenForClose,
}

const EditCaseOverview: React.FC<Props> = ({
  task,
  historyDetails,
  connectedCaseState,
  workingCopy,
  initialiseWorkingCopy,
  updateWorkingCopy,
  closeActions,
  can,
  updateCaseAsyncAction,
  isUpdating,
  definitionVersion,
}) => {
  const { connectedCase, availableStatusTransitions } = connectedCaseState ?? {};

  const caseOverviewFields = definitionVersion?.caseOverview;

  const formDefinition: FormDefinition = useMemo(() => {
    try {
      if (caseOverviewFields && Array.isArray(caseOverviewFields)) {
        return caseOverviewFields
          .filter(field => field.name !== 'createdAt' && field.name !== 'updatedAt')
          .map(field => {
            if (field.name === 'status') {
              return {
                ...field,
                options: availableStatusTransitions
              };
            }
            return field;
          });
      }
      
      return [
        {
          name: 'status',
          label: 'Case-CaseStatus',
          type: FormInputType.Select,
          options: availableStatusTransitions,
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
  }, [availableStatusTransitions, caseOverviewFields]);

  const savedForm = React.useMemo(() => {
    const {
      status,
      info,
    } = connectedCase;
    
    const result = { status };
    
    if (info) {
      Object.keys(info).forEach(key => {
        result[key] = info[key] ?? (typeof info[key] === 'boolean' ? false : '');
      });
    }
    
    return result;
  }, [connectedCase]);

  const methods = useForm();

  const [dialogState, setDialogState] = React.useState<DialogState>(DialogState.Closed);

  const { getValues } = methods;

  useEffect(() => {
    if (!workingCopy) {
      initialiseWorkingCopy(connectedCase.id, getValues() as CaseSummaryWorkingCopy);
    }
  });

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: workingCopy,
    parentsPath: '',
    updateCallback: () => updateWorkingCopy(connectedCase.id, getValues() as CaseSummaryWorkingCopy),
    isItemEnabled: item => item.name === 'status' || can(PermissionActions.EDIT_CASE_OVERVIEW),
    shouldFocusFirstElement: false,
  });

  const [l, r] = React.useMemo(() => {
    const left: JSX.Element[] = [];
    const right: JSX.Element[] = [];

    form.forEach(field => {
      const fieldDef = formDefinition.find(def => def.name === field.key);
      if (fieldDef && fieldDef.type === FormInputType.Textarea) {
        right.push(field);
      } else {
        left.push(field);
      }
    });

    return [left, right];
  }, [form, formDefinition]);

  if (!connectedCaseState?.connectedCase) return null;

  const save = async () => {
    const { status: oldStatus, id } = connectedCaseState.connectedCase;
    const { status, ...updatedInfoValues } = workingCopy;

    await updateCaseAsyncAction(id, updatedInfoValues, status === oldStatus ? undefined : status);
  };

  const saveAndLeave = async () => {
    await save();
    closeActions(connectedCase.id, false);
  };

  const strings = getTemplateStrings();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(`Case: EditCaseOverview`, () => {
    window.alert(strings['Error-Form']);
    if (dialogState) setDialogState(DialogState.Closed);
  });

  const checkForEdits = (closeModal: boolean) => {
    if (isEqual(workingCopy, savedForm)) {
      closeActions(connectedCase.id, closeModal);
    } else setDialogState(closeModal ? DialogState.OpenForClose : DialogState.OpenForBack);
  };

  return (
    <FormProvider {...methods}>
      <NavigableContainer
        task={task}
        titleCode="Case-EditCaseOverview"
        onGoBack={checkForEdits}
        onCloseModal={checkForEdits}
      >
        <CaseSummaryEditHistory {...historyDetails} />
        <Container formContainer={true}>
          <Box paddingBottom={`${BottomButtonBarHeight}px`}>
            <TwoColumnLayout>
              <ColumnarBlock>{l}</ColumnarBlock>
              <ColumnarBlock>{r}</ColumnarBlock>
            </TwoColumnLayout>
          </Box>
        </Container>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          <StyledNextStepButton
            disabled={isUpdating}
            data-testid="Case-EditCaseScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(saveAndLeave, onError)}
          >
            <Template code="BottomBar-SaveCaseSummary" />
          </StyledNextStepButton>
        </BottomButtonBar>
        <CloseCaseDialog
          data-testid="CloseCaseDialog"
          openDialog={dialogState === DialogState.OpenForClose || dialogState === DialogState.OpenForBack}
          setDialog={() => setDialogState(DialogState.Closed)}
          handleDontSaveClose={() => closeActions(connectedCase.id, dialogState === DialogState.OpenForClose)}
          handleSaveUpdate={methods.handleSubmit(saveAndLeave, onError)}
        />
      </NavigableContainer>
    </FormProvider>
  );
};

EditCaseOverview.displayName = 'EditCaseOverview';

export default connect(mapStateToProps, mapDispatchToProps)(EditCaseOverview);
