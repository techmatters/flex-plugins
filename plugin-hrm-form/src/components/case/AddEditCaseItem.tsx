/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import { v4 as uuidV4 } from 'uuid';
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import type { DefinitionVersion } from 'hrm-form-definitions';
import { isEqual } from 'lodash';

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
import { CaseState } from '../../states/case/reducer';
import { transformValues } from '../../services/ContactService';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import {
  createFormFromDefinition,
  createStateItem,
  CustomHandlers,
  disperseInputs,
  splitAt,
  splitInHalf,
} from '../common/forms/formGenerators';
import type { CaseInfo, CaseItemEntry, CustomITask, StandaloneITask } from '../../types/types';
import { AppRoutesWithCaseAndAction, CaseItemAction } from '../../states/routing/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import {
  AddTemporaryCaseInfo,
  CaseUpdater,
  EditTemporaryCaseInfo,
  isAddTemporaryCaseInfo,
  isEditTemporaryCaseInfo,
  TemporaryCaseInfo,
  temporaryCaseInfoHistory,
} from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import { CaseSectionApi, copyCaseSection } from '../../states/case/sections/api';
import { lookupApi } from '../../states/case/sections/lookup';

type CaseItemPayload = { [key: string]: string | boolean };

const UNSUPPORTED_TEMPORARY_INFO_TYPE_MESSAGE =
  'Only AddTemporaryCaseInfo and EditTemporaryCaseInfo temporary case data types are supported by this component.';

const getTemporaryFormContent = (temporaryCaseInfo: TemporaryCaseInfo): CaseItemPayload | null => {
  if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
    return temporaryCaseInfo.info.form;
  } else if (isAddTemporaryCaseInfo(temporaryCaseInfo)) {
    return temporaryCaseInfo.info;
  }
  return null;
};

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  exitItem: () => void;
  routing: AppRoutesWithCaseAndAction;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
  sectionApi: CaseSectionApi<unknown>;
};
// eslint-disable-next-line no-use-before-define
type Props = AddEditCaseItemProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddEditCaseItem: React.FC<Props> = ({
  definitionVersion,
  task,
  counselor,
  counselorsHash,
  exitItem,
  connectedCaseState,
  routing,
  setConnectedCase,
  updateTempInfo,
  changeRoute,
  customFormHandlers,
  reactHookFormOptions,
  sectionApi,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const firstElementRef = useFocus();

  const { temporaryCaseInfo } = connectedCaseState;
  const formDefinition = sectionApi.getSectionFormDefinition(definitionVersion);
  const layout = sectionApi.getSectionLayoutDefinition(definitionVersion);

  // Grab initial values in first render only. If getTemporaryFormContent(temporaryCaseInfo), cherrypick the values using formDefinition, if not build the object with getInitialValue
  const [initialForm] = React.useState(() => {
    const initialTemporaryFormContent = getTemporaryFormContent(temporaryCaseInfo);

    if (initialTemporaryFormContent)
      return formDefinition.reduce(
        (accum, curr) => ({
          ...accum,
          [curr.name]: initialTemporaryFormContent[curr.name],
        }),
        {},
      );

    return formDefinition.reduce(createStateItem, {});
  });

  const methods = useForm(reactHookFormOptions);
  const [openDialog, setOpenDialog] = React.useState(false);

  const { getValues } = methods;

  const [l, r] = React.useMemo(() => {
    const createUpdatedTemporaryFormContent = (
      payload: CaseItemPayload,
    ): AddTemporaryCaseInfo | EditTemporaryCaseInfo => {
      const isEdited = !isEqual(initialForm, payload);
      if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
        return {
          ...temporaryCaseInfo,
          info: { ...temporaryCaseInfo.info, form: payload },
          isEdited,
        };
      } else if (isAddTemporaryCaseInfo(temporaryCaseInfo)) {
        return {
          ...temporaryCaseInfo,
          info: payload,
          isEdited,
        };
      }
      throw new Error(UNSUPPORTED_TEMPORARY_INFO_TYPE_MESSAGE);
    };

    const updateCallBack = () => {
      const formValues = getValues();
      updateTempInfo(createUpdatedTemporaryFormContent(formValues), task.taskSid);
    };

    const generatedForm = createFormFromDefinition(formDefinition)([])(initialForm, firstElementRef)(
      updateCallBack,
      customFormHandlers,
    );

    if (layout.splitFormAt) return splitAt(layout.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [
    formDefinition,
    initialForm,
    firstElementRef,
    customFormHandlers,
    layout.splitFormAt,
    temporaryCaseInfo,
    getValues,
    updateTempInfo,
    task.taskSid,
  ]);

  const save = async () => {
    const { info, id } = connectedCaseState.connectedCase;
    const form = transformValues(formDefinition)(getTemporaryFormContent(temporaryCaseInfo));
    const now = new Date().toISOString();
    const { workerSid } = getConfig();
    let newInfo: CaseInfo;
    if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
      /*
       * Need to add these to the temporaryCaseInfo instance rather than straight to the applyTemporaryInfoToCase parameter.
       * This way changes are reflected when you go back to the view after an edit
       */
      temporaryCaseInfo.info.updatedAt = now;
      temporaryCaseInfo.info.updatedBy = workerSid;
      newInfo = sectionApi.upsertCaseSectionItemFromForm(info, {
        ...temporaryCaseInfo.info,
        form,
      });
    } else {
      const newItem: CaseItemEntry = {
        form,
        createdAt: now,
        twilioWorkerId: workerSid,
        id: uuidV4(),
      };
      newInfo = sectionApi.upsertCaseSectionItemFromForm(info, newItem);
      formDefinition.forEach(fd => {
        // A preceding 'filter' call looks nicer but TS type narrowing isn't smart enough to work with that.
        if (fd.type === 'copy-to' && form[fd.name]) {
          copyCaseSection({
            definition: definitionVersion,
            original: newInfo,
            fromApi: sectionApi,
            toApi: lookupApi(fd.target),
          });
        }
      });
    }
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, connectedCaseState.caseHasBeenEdited);
  };

  async function close() {
    if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
      updateTempInfo({ ...temporaryCaseInfo, action: CaseItemAction.View }, task.taskSid);
      changeRoute({ ...routing, action: CaseItemAction.View }, task.taskSid);
    } else {
      exitItem();
    }
  }

  async function saveAndStay() {
    await save();
    if (isAddTemporaryCaseInfo(temporaryCaseInfo)) {
      const blankForm = formDefinition.reduce(createStateItem, {});
      methods.reset(blankForm); // Resets the form.
      updateTempInfo({ screen: temporaryCaseInfo.screen, info: null, action: CaseItemAction.Add }, task.taskSid);
      changeRoute({ ...routing, action: CaseItemAction.Add }, task.taskSid);
    }
  }

  async function saveAndLeave() {
    await save();
    close();
  }

  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(
    routing.action === CaseItemAction.Edit ? `Case: Edit ${sectionApi.label}` : `Case: Add ${sectionApi.label}`,
    () => {
      window.alert(strings['Error-Form']);
      if (openDialog) setOpenDialog(false);
    },
  );

  const { added, addingCounsellorName, updated, updatingCounsellorName } = isEditTemporaryCaseInfo(temporaryCaseInfo)
    ? temporaryCaseInfoHistory(temporaryCaseInfo, counselorsHash)
    : { added: new Date(), addingCounsellorName: counselor, updated: undefined, updatingCounsellorName: undefined };

  const checkForEdits = () => {
    if (
      (isEditTemporaryCaseInfo(temporaryCaseInfo) || isAddTemporaryCaseInfo(temporaryCaseInfo)) &&
      temporaryCaseInfo.isEdited
    ) {
      setOpenDialog(true);
    } else close();
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
          <CloseCaseDialog
            data-testid="CloseCase-Dialog"
            openDialog={openDialog}
            setDialog={() => setOpenDialog(false)}
            handleDontSaveClose={close}
            handleSaveUpdate={methods.handleSubmit(saveAndLeave, onError)}
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
              handleDontSaveClose={close}
              handleSaveUpdate={methods.handleSubmit(saveAndLeave, onError)}
            />
          </Box>
          {routing.action === CaseItemAction.Add && (
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="Case-AddEditItemScreen-SaveAndAddAnotherItem"
                secondary
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

const mapStateToProps = (state: RootState, ownProps: AddEditCaseItemProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState, counselorsHash };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEditCaseItem);
