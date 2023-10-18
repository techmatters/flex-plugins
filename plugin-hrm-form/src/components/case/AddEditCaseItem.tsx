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
} from '../../styles/HrmStyles';
import { CaseActionFormContainer, CaseActionLayout } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { RootState } from '../../states';
import { createStateItem, CustomHandlers, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import type { Case, CaseInfo, CaseItemEntry, CustomITask, StandaloneITask } from '../../types/types';
import {
  AddCaseSectionRoute,
  CaseItemAction,
  EditCaseSectionRoute,
  isEditCaseSectionRoute,
} from '../../states/routing/types';
import { recordingErrorHandler } from '../../fullStory';
import { caseItemHistory, CaseState } from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import { CaseSectionApi } from '../../states/case/sections/api';
import { lookupApi } from '../../states/case/sections/lookupApi';
import { copyCaseSectionItem } from '../../states/case/sections/update';
import { newGoBackAction } from '../../states/routing/actions';
import {
  initialiseExistingCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  removeCaseSectionWorkingCopy,
  updateCaseSectionWorkingCopy,
} from '../../states/case/caseWorkingCopy';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import asyncDispatch from '../../states/asyncDispatch';
import { updateCaseAsyncAction } from '../../states/case/saveCase';
import { configurationBase, connectedCaseBase, namespace } from '../../states/storeNamespaces';

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  routing: AddCaseSectionRoute | EditCaseSectionRoute;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
  sectionApi: CaseSectionApi<unknown>;
};
// eslint-disable-next-line no-use-before-define
type Props = AddEditCaseItemProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const AddEditCaseItem: React.FC<Props> = ({
  definitionVersion,
  task,
  counselor,
  counselorsHash,
  connectedCase,
  routing,
  updateCaseSectionWorkingCopy,
  initialiseCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  closeActions,
  customFormHandlers,
  reactHookFormOptions,
  sectionApi,
  workingCopy,
  updateCaseAsyncAction,
}) => {
  const { id } = isEditCaseSectionRoute(routing) ? routing : { id: undefined };

  const formDefinition = React.useMemo(
    () =>
      sectionApi
        .getSectionFormDefinition(definitionVersion)
        // If more 'when adding only' form item types are implemented, we should create a specific property, but there is only one so just check the type for now
        .filter(fd => !id || fd.type !== 'copy-to'),
    [definitionVersion, id, sectionApi],
  );
  const layout = sectionApi.getSectionLayoutDefinition(definitionVersion);

  // Grab initial values in first render only. If getTemporaryFormContent(temporaryCaseInfo), cherrypick the values using formDefinition, if not build the object with getInitialValue
  const savedForm = React.useMemo(() => {
    if (id && connectedCase) {
      const { form } = sectionApi.toForm(sectionApi.getSectionItemById(connectedCase.info, id));
      return formDefinition.reduce(
        (accum, curr) => ({
          ...accum,
          [curr.name]: form[curr.name],
        }),
        {},
      );
    }
    return formDefinition.reduce(createStateItem, {});
  }, [connectedCase, formDefinition, id, sectionApi]);

  useEffect(() => {
    if (!workingCopy) {
      if (id) {
        initialiseCaseSectionWorkingCopy(task.taskSid, sectionApi, id);
      } else {
        initialiseNewCaseSectionWorkingCopy(task.taskSid, sectionApi, savedForm);
      }
    }
  }, [
    id,
    initialiseCaseSectionWorkingCopy,
    initialiseNewCaseSectionWorkingCopy,
    sectionApi,
    task.taskSid,
    workingCopy,
    savedForm,
  ]);

  const methods = useForm(reactHookFormOptions);
  const [openDialog, setOpenDialog] = React.useState(false);

  const { getValues } = methods;

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: workingCopy?.form,
    parentsPath: '',
    updateCallback: () => {
      const form = getValues();
      console.log('Updated case form', form);
      updateCaseSectionWorkingCopy(task.taskSid, sectionApi, { ...workingCopy, form }, id);
    },
    customHandlers: customFormHandlers,
  });

  const [l, r] = layout.splitFormAt
    ? splitAt(layout.splitFormAt)(disperseInputs(7)(form))
    : splitInHalf(disperseInputs(7)(form));

  if (!workingCopy) {
    return null;
  }

  const save = async () => {
    const { info, id: caseId } = connectedCase;
    const { form } = workingCopy;
    const now = new Date().toISOString();
    const { workerSid } = getHrmConfig();
    let newInfo: CaseInfo;
    if (id) {
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
    updateCaseAsyncAction(caseId, { info: newInfo });
  };

  function close() {
    closeActions();
  }

  async function saveAndStay() {
    await save();
    closeActions(false);

    // Reset the entire form state, fields reference, and subscriptions.
    methods.reset();
  }

  async function saveAndLeave() {
    await save();
    closeActions();
  }

  const strings = getTemplateStrings();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(
    routing.action === CaseItemAction.Edit ? `Case: Edit ${sectionApi.label}` : `Case: Add ${sectionApi.label}`,
    () => {
      window.alert(strings['Error-Form']);
      if (openDialog) setOpenDialog(false);
    },
  );

  const { added, addingCounsellorName, updated, updatingCounsellorName } = id
    ? caseItemHistory(workingCopy, counselorsHash)
    : { added: new Date(), addingCounsellorName: counselor, updated: undefined, updatingCounsellorName: undefined };

  const checkForEdits = () => {
    if (isEqual(workingCopy?.form, savedForm)) {
      close();
    } else setOpenDialog(true);
  };
  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader
            titleTemplate={
              routing.action === CaseItemAction.Edit ? `Case-Edit${sectionApi.label}` : `Case-Add${sectionApi.label}`
            }
            onClickClose={checkForEdits}
            addingCounsellor={addingCounsellorName}
            added={added}
            updatingCounsellor={updatingCounsellorName}
            updated={updated}
          />
          <Container>
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
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary="true" roundCorners onClick={checkForEdits}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
            <CloseCaseDialog
              data-testid="CloseCaseDialog"
              openDialog={openDialog}
              setDialog={() => setOpenDialog(false)}
              handleDontSaveClose={close}
              handleSaveUpdate={methods.handleSubmit(saveAndLeave, onError)}
            />
          </Box>
          {routing.action === CaseItemAction.Add && (
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
            onClick={methods.handleSubmit(saveAndLeave, onError)}
          >
            <Template code={`BottomBar-Save${sectionApi.label}`} />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddEditCaseItem.displayName = 'AddEditCaseItem';

const mapStateToProps = (state: RootState, { task, routing, sectionApi }: AddEditCaseItemProps) => {
  const id = isEditCaseSectionRoute(routing) ? routing.id : undefined;
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const { connectedCase, caseWorkingCopy } = caseState.tasks[task.taskSid];
  const workingCopy = sectionApi.getWorkingCopy(caseWorkingCopy, id);

  return { connectedCase, counselorsHash, workingCopy };
};

const mapDispatchToProps = (dispatch, props: AddEditCaseItemProps) => {
  const { sectionApi, routing, task } = props;
  const id = isEditCaseSectionRoute(routing) ? routing.id : undefined;
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    updateCaseSectionWorkingCopy: bindActionCreators(updateCaseSectionWorkingCopy, dispatch),
    initialiseCaseSectionWorkingCopy: bindActionCreators(initialiseExistingCaseSectionWorkingCopy, dispatch),
    initialiseNewCaseSectionWorkingCopy: bindActionCreators(initialiseNewCaseSectionWorkingCopy, dispatch),
    closeActions: (closeForm: boolean = true) => {
      dispatch(removeCaseSectionWorkingCopy(task.taskSid, sectionApi, id));
      if (closeForm) {
        dispatch(newGoBackAction(task.taskSid));
      }
    },
    updateCaseAsyncAction: (caseId: Case['id'], body: Partial<Case>) =>
      searchAsyncDispatch(updateCaseAsyncAction(caseId, task.taskSid, body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEditCaseItem);
