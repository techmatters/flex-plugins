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
import React, { useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import type { DefinitionVersion } from '@tech-matters/hrm-form-definitions';
import { isEqual } from 'lodash';

import {
  BottomButtonBar,
  BottomButtonBarHeight,
  Box,
  ColumnarBlock,
  ColumnarContent,
  Container,
  StyledNextStepButton,
  TwoColumnLayout,
} from '../../styles';
import { CaseActionFormContainer } from './styles';
import ActionHeader from './ActionHeader';
import { RootState } from '../../states';
import { createStateItem, CustomHandlers, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import type { Case, CustomITask, StandaloneITask } from '../../types/types';
import {
  CaseItemAction,
  CaseRoute,
  isAddCaseSectionRoute,
  isCaseRoute,
  isEditCaseSectionRoute,
} from '../../states/routing/types';
import { recordingErrorHandler } from '../../fullStory';
import CloseCaseDialog from './CloseCaseDialog';
import { newCloseModalAction, newGoBackAction } from '../../states/routing/actions';
import {
  initialiseExistingCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  removeCaseSectionWorkingCopy,
  updateCaseSectionWorkingCopy,
} from '../../states/case/caseWorkingCopy';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import asyncDispatch from '../../states/asyncDispatch';
import NavigableContainer from '../NavigableContainer';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import selectCaseItemHistory from '../../states/case/sections/selectCaseItemHistory';
import { selectCounselorName } from '../../states/configuration/selectCounselorsHash';
import {
  createCaseSectionAsyncAction,
  updateCaseSectionAsyncAction,
} from '../../states/case/sections/caseSectionUpdates';
import { getWorkingCopy } from '../../states/case/sections/workingCopy';
import { getSectionItemById } from '../../states/case/sections/get';

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
  sectionTypeName: string;
};

enum DismissAction {
  NONE,
  BACK,
  CLOSE,
}

const AddEditCaseItem: React.FC<AddEditCaseItemProps> = ({
  definitionVersion,
  task,
  customFormHandlers,
  reactHookFormOptions,
  sectionTypeName,
}) => {
  const { workerSid } = getHrmConfig();
  const currentRoute: CaseRoute = useSelector((state: RootState) => {
    const route = selectCurrentTopmostRouteForTask(state, task.taskSid);
    return isCaseRoute(route) ? route : undefined;
  });
  const { caseWorkingCopy, sections, outstandingUpdateCount } = useSelector((state: RootState) =>
    selectCaseByCaseId(state, currentRoute.caseId),
  );
  const isUpdating = outstandingUpdateCount > 0;
  const sectionId = isEditCaseSectionRoute(currentRoute) ? currentRoute.id : undefined;
  const workingCopy = getWorkingCopy(sectionTypeName)(caseWorkingCopy, sectionId);
  const caseItemHistory = useSelector((state: RootState) =>
    sectionId
      ? selectCaseItemHistory(state, currentRoute.caseId, sectionTypeName, sectionId)
      : {
          added: new Date(),
          addingCounsellorName: selectCounselorName(state, workerSid),
          updated: undefined,
          updatingCounsellorName: undefined,
        },
  );
  const { form: formDefinition, label } = definitionVersion.caseSectionTypes[sectionTypeName];
  const layout = definitionVersion.layoutVersion.case.sectionTypes[sectionTypeName] || { splitFormAt: undefined };
  const dispatch = useDispatch();
  const asyncDispatcher = asyncDispatch(dispatch);

  const savedForm = React.useMemo(() => {
    if (sectionId && sections) {
      const { sectionTypeSpecificData: form } = getSectionItemById(sectionTypeName)(sections, sectionId);
      return formDefinition.reduce(
        (accum, curr) => ({
          ...accum,
          [curr.name]: form[curr.name],
        }),
        {},
      );
    }
    return formDefinition.reduce(createStateItem, {});
  }, [sectionId, sections, formDefinition, sectionTypeName]);

  useEffect(() => {
    if (!workingCopy) {
      if (sectionId) {
        dispatch(initialiseExistingCaseSectionWorkingCopy(currentRoute.caseId, sectionTypeName, sectionId));
      } else {
        dispatch(initialiseNewCaseSectionWorkingCopy(currentRoute.caseId, sectionTypeName, savedForm));
      }
    }
  }, [sectionId, workingCopy, savedForm, currentRoute.caseId, dispatch, sectionTypeName]);

  const methods = useForm(reactHookFormOptions);

  enum DialogState {
    CLOSED,
    OPEN_FOR_BACK,
    OPEN_FOR_CLOSE,
  }

  const [dialogState, setDialogState] = React.useState(DialogState.CLOSED);

  const { getValues } = methods;

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: workingCopy,
    parentsPath: '',
    updateCallback: () => {
      const form = getValues();
      console.log('Updated case form', form);
      dispatch(
        updateCaseSectionWorkingCopy(currentRoute.caseId, sectionTypeName, { ...workingCopy, ...form }, sectionId),
      );
    },
    customHandlers: customFormHandlers,
    shouldFocusFirstElement: false,
  });

  if (!isEditCaseSectionRoute(currentRoute) && !isAddCaseSectionRoute(currentRoute)) {
    return null;
  }

  if (!sections || !workingCopy) {
    return null;
  }

  const { caseId } = currentRoute;

  const [l, r] = layout.splitFormAt
    ? splitAt(layout.splitFormAt)(disperseInputs(7)(form))
    : splitInHalf(disperseInputs(7)(form));

  const closeActions = (caseId: Case['id'], id: string, action: DismissAction) => {
    dispatch(removeCaseSectionWorkingCopy(caseId, sectionTypeName, id));
    if (action === DismissAction.BACK) {
      dispatch(newGoBackAction(task.taskSid));
    } else if (action === DismissAction.CLOSE) {
      dispatch(newCloseModalAction(task.taskSid));
    }
  };

  const save = async () => {
    if (sectionId) {
      await asyncDispatcher(
        updateCaseSectionAsyncAction(caseId, sectionTypeName, sectionId, workingCopy, definitionVersion),
      );
    } else {
      await asyncDispatcher(createCaseSectionAsyncAction(caseId, sectionTypeName, workingCopy, definitionVersion));
    }
  };

  function close(action: DismissAction) {
    closeActions(caseId, sectionId, action);
  }

  async function saveAndStay() {
    await save();
    closeActions(caseId, sectionId, DismissAction.NONE);

    // Reset the entire form state, fields reference, and subscriptions.
    methods.reset();
  }

  async function saveAndLeave(followingAction: DismissAction) {
    await save();
    closeActions(caseId, sectionId, followingAction);
  }

  const strings = getTemplateStrings();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(
    currentRoute.action === CaseItemAction.Edit ? `Case: Edit ${label}` : `Case: Add ${label}`,
    () => {
      window.alert(strings['Error-Form']);
      if (dialogState !== DialogState.CLOSED) setDialogState(DialogState.CLOSED);
    },
  );

  const { added, addingCounsellorName, updated, updatingCounsellorName } = caseItemHistory;

  const checkForEdits = (action: DismissAction) => {
    if (isEqual(workingCopy, savedForm)) {
      close(action);
    } else setDialogState(action === DismissAction.CLOSE ? DialogState.OPEN_FOR_CLOSE : DialogState.OPEN_FOR_BACK);
  };
  return (
    <FormProvider {...methods}>
      <NavigableContainer
        titleCode={
          currentRoute.action === CaseItemAction.Edit
            ? `CaseSection-Edit/${sectionTypeName}`
            : `CaseSection-Add/${sectionTypeName}`
        }
        onGoBack={() => checkForEdits(DismissAction.BACK)}
        onCloseModal={() => checkForEdits(DismissAction.CLOSE)}
        task={task}
      >
        <CaseActionFormContainer>
          <ActionHeader
            addingCounsellor={addingCounsellorName}
            added={added}
            updatingCounsellor={updatingCounsellorName}
            updated={updated}
          />
          <Container formContainer={true}>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>
                  <ColumnarContent>{l}</ColumnarContent>
                </ColumnarBlock>
                <ColumnarBlock>
                  <ColumnarContent>{r}</ColumnarContent>
                </ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>{' '}
        </CaseActionFormContainer>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          {currentRoute.action === CaseItemAction.Add && (
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="Case-AddEditItemScreen-SaveAndAddAnotherItem"
                secondary="true"
                roundCorners
                onClick={methods.handleSubmit(saveAndStay, onError)}
                disabled={isUpdating}
              >
                <Template code={`CaseSection-BottomBar-SaveAndAddAnother/${sectionTypeName}`} />
              </StyledNextStepButton>
            </Box>
          )}
          <StyledNextStepButton
            data-testid="Case-AddEditItemScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(() => saveAndLeave(DismissAction.BACK), onError)}
            disabled={isUpdating}
          >
            <Template code={`CaseSection-BottomBar-Save/${sectionTypeName}`} />
          </StyledNextStepButton>
        </BottomButtonBar>
        <CloseCaseDialog
          data-testid="CloseCaseDialog"
          openDialog={dialogState !== DialogState.CLOSED}
          setDialog={() => setDialogState(DialogState.CLOSED)}
          handleDontSaveClose={() =>
            close(dialogState === DialogState.OPEN_FOR_CLOSE ? DismissAction.CLOSE : DismissAction.BACK)
          }
          handleSaveUpdate={methods.handleSubmit(
            () => saveAndLeave(dialogState === DialogState.OPEN_FOR_CLOSE ? DismissAction.CLOSE : DismissAction.BACK),
            onError,
          )}
        />
      </NavigableContainer>
    </FormProvider>
  );
};

AddEditCaseItem.displayName = 'AddEditCaseItem';

export default AddEditCaseItem;
