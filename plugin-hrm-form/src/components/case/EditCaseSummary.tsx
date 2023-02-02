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
import { changeRoute } from '../../states/routing/actions';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import { createFormFromDefinition, disperseInputs, splitAt } from '../common/forms/formGenerators';
import type { CustomITask, StandaloneITask } from '../../types/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import { caseItemHistory, CaseSummaryWorkingCopy } from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import {
  initialiseCaseSummaryWorkingCopy,
  removeCaseSummaryWorkingCopy,
  updateCaseSummaryWorkingCopy,
} from '../../states/case/caseWorkingCopy';
import { AppRoutes } from '../../states/routing/types';
import { PermissionActions, PermissionActionType } from '../../permissions';

export type EditCaseSummaryProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  exitRoute: AppRoutes;
  can: (action: PermissionActionType) => boolean;
};
// eslint-disable-next-line no-use-before-define
type Props = EditCaseSummaryProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const EditCaseSummary: React.FC<Props> = ({
  task,
  counselorsHash,
  exitRoute,
  connectedCaseState,
  setConnectedCase,
  workingCopy,
  initialiseWorkingCopy,
  updateWorkingCopy,
  closeActions,
  can,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const firstElementRef = useFocus();

  const formDefinition: FormDefinition = useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps

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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const methods = useForm();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [openDialog, setOpenDialog] = React.useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { getValues } = methods;

  useEffect(() => {
    if (!workingCopy) {
      initialiseWorkingCopy(task.taskSid, getValues() as CaseSummaryWorkingCopy);
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const formValues = getValues();
      updateWorkingCopy(task.taskSid, formValues as CaseSummaryWorkingCopy);
    };
    const generatedForm = createFormFromDefinition(formDefinition)([])(workingCopy, firstElementRef, item => {
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
    })(updateCallBack);
    return splitAt(3)(disperseInputs(7)(generatedForm));
  }, [formDefinition, workingCopy, firstElementRef, getValues, updateWorkingCopy, task.taskSid, can]);

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

  const { added, addingCounsellorName, updated, updatingCounsellorName } = caseItemHistory(
    connectedCaseState.connectedCase,
    counselorsHash,
  );

  const checkForEdits = () => {
    if (isEqual(workingCopy, savedForm)) {
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
