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
import { connect, ConnectedProps } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import type { DefinitionVersion } from 'hrm-form-definitions';
import { isEqual } from 'lodash';
import { AnyAction, bindActionCreators } from 'redux';

import {
  BottomButtonBar,
  BottomButtonBarHeight,
  Box,
  ColumnarBlock,
  ColumnarContent,
  Container,
  PrimaryButton,
  TwoColumnLayout,
} from '../../styles';
import { CaseActionFormContainer } from './styles';
import ActionHeader from './ActionHeader';
import { RootState } from '../../states';
import { createStateItem, CustomHandlers, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import type { Case, CustomITask, StandaloneITask } from '../../types/types';
import { CaseItemAction, isAddCaseSectionRoute, isCaseRoute, isEditCaseSectionRoute } from '../../states/routing/types';
import { recordingErrorHandler } from '../../fullStory';
import CloseCaseDialog from './CloseCaseDialog';
import { CaseSectionApi } from '../../states/case/sections/api';
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
import { CaseSectionTypeSpecificData } from '../../services/caseSectionService';

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
  sectionApi: CaseSectionApi;
};

const mapStateToProps = (state: RootState, { task, sectionApi }: AddEditCaseItemProps) => {
  const { workerSid } = getHrmConfig();
  const currentRoute = selectCurrentTopmostRouteForTask(state, task.taskSid);

  if (isCaseRoute(currentRoute)) {
    const sectionId = isEditCaseSectionRoute(currentRoute) ? currentRoute.id : undefined;
    const { caseWorkingCopy, sections, outstandingUpdateCount } = selectCaseByCaseId(state, currentRoute.caseId);
    const caseItemHistory = sectionId
      ? selectCaseItemHistory(state, currentRoute.caseId, sectionApi, sectionId)
      : {
          added: new Date(),
          addingCounsellorName: selectCounselorName(state, workerSid),
          updated: undefined,
          updatingCounsellorName: undefined,
        };

    const workingCopy = sectionApi.getWorkingCopy(caseWorkingCopy, sectionId);

    return { caseItemHistory, workingCopy, currentRoute, sections, sectionId, isUpdating: outstandingUpdateCount > 0 };
  }
  return {
    connectedCase: undefined,
    sections: undefined,
    caseItemHistory: undefined,
    workingCopy: undefined,
    sectionId: undefined,
    isUpdating: false,
  };
};

const mapDispatchToProps = (dispatch, { sectionApi, task, definitionVersion }: AddEditCaseItemProps) => {
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    updateCaseSectionWorkingCopy: bindActionCreators(updateCaseSectionWorkingCopy, dispatch),
    initialiseCaseSectionWorkingCopy: bindActionCreators(initialiseExistingCaseSectionWorkingCopy, dispatch),
    initialiseNewCaseSectionWorkingCopy: bindActionCreators(initialiseNewCaseSectionWorkingCopy, dispatch),
    closeActions: (caseId: Case['id'], id: string, action: DismissAction) => {
      dispatch(removeCaseSectionWorkingCopy(caseId, sectionApi, id));
      if (action === DismissAction.BACK) {
        dispatch(newGoBackAction(task.taskSid));
      } else if (action === DismissAction.CLOSE) {
        dispatch(newCloseModalAction(task.taskSid));
      }
    },

    createCaseSection: (caseId: Case['id'], newSection: CaseSectionTypeSpecificData) =>
      searchAsyncDispatch(createCaseSectionAsyncAction(caseId, sectionApi, newSection, definitionVersion)),

    updateCaseSection: (caseId: Case['id'], sectionId, update: CaseSectionTypeSpecificData) =>
      searchAsyncDispatch(updateCaseSectionAsyncAction(caseId, sectionApi, sectionId, update, definitionVersion)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

// eslint-disable-next-line no-use-before-define
type Props = AddEditCaseItemProps & ConnectedProps<typeof connector>;

enum DismissAction {
  NONE,
  BACK,
  CLOSE,
}

const AddEditCaseItem: React.FC<Props> = ({
  definitionVersion,
  task,
  caseItemHistory,
  updateCaseSectionWorkingCopy,
  initialiseCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  closeActions,
  customFormHandlers,
  reactHookFormOptions,
  sectionApi,
  workingCopy,
  currentRoute,
  sectionId,
  updateCaseSection,
  createCaseSection,
  sections,
  isUpdating,
}) => {
  const formDefinition = React.useMemo(() => sectionApi.getSectionFormDefinition(definitionVersion), [
    definitionVersion,
    sectionApi,
  ]);
  const layout = sectionApi.getSectionLayoutDefinition(definitionVersion);

  const savedForm = React.useMemo(() => {
    if (sectionId && sections) {
      const { sectionTypeSpecificData: form } = sectionApi.getSectionItemById(sections, sectionId);
      return formDefinition.reduce(
        (accum, curr) => ({
          ...accum,
          [curr.name]: form[curr.name],
        }),
        {},
      );
    }
    return formDefinition.reduce(createStateItem, {});
  }, [sections, formDefinition, sectionId, sectionApi]);

  useEffect(() => {
    if (!workingCopy) {
      if (sectionId) {
        initialiseCaseSectionWorkingCopy(currentRoute.caseId, sectionApi, sectionId);
      } else {
        initialiseNewCaseSectionWorkingCopy(currentRoute.caseId, sectionApi, savedForm);
      }
    }
  }, [
    sectionId,
    initialiseCaseSectionWorkingCopy,
    initialiseNewCaseSectionWorkingCopy,
    sectionApi,
    workingCopy,
    savedForm,
    currentRoute.caseId,
  ]);

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
      updateCaseSectionWorkingCopy(currentRoute.caseId, sectionApi, { ...workingCopy, ...form }, sectionId);
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

  const save = async () => {
    if (sectionId) {
      await updateCaseSection(caseId, sectionId, workingCopy);
    } else {
      await createCaseSection(caseId, workingCopy);
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
    currentRoute.action === CaseItemAction.Edit ? `Case: Edit ${sectionApi.label}` : `Case: Add ${sectionApi.label}`,
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
          currentRoute.action === CaseItemAction.Edit ? `Case-Edit${sectionApi.label}` : `Case-Add${sectionApi.label}`
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
              <PrimaryButton
                data-testid="Case-AddEditItemScreen-SaveAndAddAnotherItem"
                secondary="true"
                roundCorners
                onClick={methods.handleSubmit(saveAndStay, onError)}
                disabled={isUpdating}
              >
                <Template code={`BottomBar-SaveAndAddAnother${sectionApi.label}`} />
              </PrimaryButton>
            </Box>
          )}
          <PrimaryButton
            data-testid="Case-AddEditItemScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(() => saveAndLeave(DismissAction.BACK), onError)}
            disabled={isUpdating}
          >
            <Template code={`BottomBar-Save${sectionApi.label}`} />
          </PrimaryButton>
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

export default connector(AddEditCaseItem);
