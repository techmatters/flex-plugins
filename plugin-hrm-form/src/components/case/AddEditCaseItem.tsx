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
import { v4 as uuidV4 } from 'uuid';
import React, { useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
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
  StyledNextStepButton,
  TwoColumnLayout,
} from '../../styles';
import { CaseActionFormContainer } from './styles';
import ActionHeader from './ActionHeader';
import { RootState } from '../../states';
import { createStateItem, CustomHandlers, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import type { Case, CaseInfo, CaseItemEntry, CustomITask, StandaloneITask } from '../../types/types';
import { CaseItemAction, isAddCaseSectionRoute, isCaseRoute, isEditCaseSectionRoute } from '../../states/routing/types';
import { recordingErrorHandler } from '../../fullStory';
import CloseCaseDialog from './CloseCaseDialog';
import { CaseSectionApi } from '../../states/case/sections/api';
import { lookupApi } from '../../states/case/sections/lookupApi';
import { copyCaseSectionItem } from '../../states/case/sections/update';
import { newCloseModalAction, newGoBackAction } from '../../states/routing/actions';
import {
  initialiseExistingCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  removeCaseSectionWorkingCopy,
  updateCaseSectionWorkingCopy,
} from '../../states/case/caseWorkingCopy';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import asyncDispatch from '../../states/asyncDispatch';
import { updateCaseAsyncAction } from '../../states/case/saveCase';
import NavigableContainer from '../NavigableContainer';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import selectCaseItemHistory from '../../states/case/sections/selectCaseItemHistory';
import { selectCounselorName } from '../../states/configuration/selectCounselorsHash';

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
  sectionApi: CaseSectionApi<unknown>;
};
// eslint-disable-next-line no-use-before-define
type Props = AddEditCaseItemProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

enum DismissAction {
  NONE,
  BACK,
  CLOSE,
}

const AddEditCaseItem: React.FC<Props> = ({
  definitionVersion,
  task,
  caseItemHistory,
  connectedCase,
  updateCaseSectionWorkingCopy,
  initialiseCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  closeActions,
  customFormHandlers,
  reactHookFormOptions,
  sectionApi,
  workingCopy,
  updateCaseAsyncAction,
  currentRoute,
  sectionId,
}) => {
  const formDefinition = React.useMemo(
    () =>
      sectionApi
        .getSectionFormDefinition(definitionVersion)
        // If more 'when adding only' form item types are implemented, we should create a specific property, but there is only one so just check the type for now
        .filter(fd => !sectionId || fd.type !== 'copy-to'),
    [definitionVersion, sectionId, sectionApi],
  );
  const layout = sectionApi.getSectionLayoutDefinition(definitionVersion);

  // Grab initial values in first render only. If getTemporaryFormContent(temporaryCaseInfo), cherrypick the values using formDefinition, if not build the object with getInitialValue
  const savedForm = React.useMemo(() => {
    if (sectionId && connectedCase) {
      const { form } = sectionApi.toForm(sectionApi.getSectionItemById(connectedCase.info, sectionId));
      return formDefinition.reduce(
        (accum, curr) => ({
          ...accum,
          [curr.name]: form[curr.name],
        }),
        {},
      );
    }
    return formDefinition.reduce(createStateItem, {});
  }, [connectedCase, formDefinition, sectionId, sectionApi]);

  useEffect(() => {
    if (!workingCopy) {
      if (sectionId) {
        initialiseCaseSectionWorkingCopy(connectedCase.id, sectionApi, sectionId);
      } else {
        initialiseNewCaseSectionWorkingCopy(connectedCase.id, sectionApi, savedForm);
      }
    }
  }, [
    sectionId,
    initialiseCaseSectionWorkingCopy,
    initialiseNewCaseSectionWorkingCopy,
    sectionApi,
    workingCopy,
    savedForm,
    connectedCase.id,
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
    initialValues: workingCopy?.form,
    parentsPath: '',
    updateCallback: () => {
      const form = getValues();
      console.log('Updated case form', form);
      updateCaseSectionWorkingCopy(connectedCase?.id, sectionApi, { ...workingCopy, form }, sectionId);
    },
    customHandlers: customFormHandlers,
    shouldFocusFirstElement: false,
  });

  if (!isEditCaseSectionRoute(currentRoute) && !isAddCaseSectionRoute(currentRoute)) {
    return null;
  }

  if (!connectedCase || !workingCopy) {
    return null;
  }

  const { id: caseId } = connectedCase;

  const [l, r] = layout.splitFormAt
    ? splitAt(layout.splitFormAt)(disperseInputs(7)(form))
    : splitInHalf(disperseInputs(7)(form));

  const save = async () => {
    const { info, id: caseId } = connectedCase;
    const { form } = workingCopy;
    const now = new Date().toISOString();
    const { workerSid } = getHrmConfig();
    let newInfo: CaseInfo;
    if (sectionId) {
      newInfo = sectionApi.upsertCaseSectionItemFromForm(info, {
        ...workingCopy,
        form,
        updatedAt: now,
        updatedBy: workerSid,
      });
    } else {
      const newItem: CaseItemEntry = {
        ...workingCopy,
        form,
        createdAt: now,
        twilioWorkerId: workerSid,
        id: uuidV4(),
      };
      newInfo = sectionApi.upsertCaseSectionItemFromForm(info, newItem);
      formDefinition.forEach(fd => {
        // A preceding 'filter' call looks nicer but TS type narrowing isn't smart enough to work with that.
        if (fd.type === 'copy-to' && form[fd.name]) {
          newInfo = copyCaseSectionItem({
            definition: definitionVersion,
            original: newInfo,
            fromApi: sectionApi,
            toApi: lookupApi(fd.target),
          });
        }
      });
    }
    await updateCaseAsyncAction(caseId, { info: newInfo });
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
    if (isEqual(workingCopy?.form, savedForm)) {
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
              <StyledNextStepButton
                data-testid="Case-AddEditItemScreen-SaveAndAddAnotherItem"
                secondary="true"
                roundCorners
                onClick={methods.handleSubmit(saveAndStay, onError)}
              >
                <Template code={`BottomBar-SaveAndAddAnother${sectionApi.label}`} />
              </StyledNextStepButton>
            </Box>
          )}
          <StyledNextStepButton
            data-testid="Case-AddEditItemScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(() => saveAndLeave(DismissAction.BACK), onError)}
          >
            <Template code={`BottomBar-Save${sectionApi.label}`} />
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

const mapStateToProps = (state: RootState, { task, sectionApi, counselor }: AddEditCaseItemProps) => {
  const currentRoute = selectCurrentTopmostRouteForTask(state, task.taskSid);
  if (isCaseRoute(currentRoute)) {
    const sectionId = isEditCaseSectionRoute(currentRoute) ? currentRoute.id : undefined;
    const { connectedCase, caseWorkingCopy } = selectCaseByCaseId(state, currentRoute.caseId);
    const caseItemHistory = sectionId
      ? selectCaseItemHistory(state, connectedCase, sectionApi, currentRoute.caseId)
      : {
          added: new Date(),
          addingCounsellorName: selectCounselorName(state, counselor),
          updated: undefined,
          updatingCounsellorName: undefined,
        };

    const workingCopy = sectionApi.getWorkingCopy(caseWorkingCopy, sectionId);

    return { connectedCase, caseItemHistory, workingCopy, currentRoute, sectionId };
  }
  return {
    connectedCase: undefined,
    caseItemHistory: undefined,
    workingCopy: undefined,
    currentRoute: undefined,
    sectionId: undefined,
  };
};

const mapDispatchToProps = (dispatch, props: AddEditCaseItemProps) => {
  const { sectionApi, task } = props;
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
    updateCaseAsyncAction: (caseId: Case['id'], body: Partial<Case>) =>
      searchAsyncDispatch(updateCaseAsyncAction(caseId, body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEditCaseItem);
