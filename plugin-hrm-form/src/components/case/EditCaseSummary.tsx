/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import { v4 as uuidV4 } from 'uuid';
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import type { DefinitionVersion, FormDefinition } from 'hrm-form-definitions';
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
  CustomHandlers,
  disperseInputs,
  splitAt,
  splitInHalf,
} from '../common/forms/formGenerators';
import type { CaseInfo, CustomITask, StandaloneITask } from '../../types/types';
import { AppRoutesWithCaseAndAction } from '../../states/routing/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import {
  CaseUpdater,
  EditTemporaryCaseInfo,
  isEditTemporaryCaseInfo,
  TemporaryCaseInfo,
  temporaryCaseInfoHistory,
} from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';

type CaseItemPayload = { [key: string]: string | boolean };

const UNSUPPORTED_TEMPORARY_INFO_TYPE_MESSAGE =
  'Only EditTemporaryCaseInfo temporary case data types are supported by this component.';

const getTemporaryFormContent = (temporaryCaseInfo: TemporaryCaseInfo): CaseItemPayload | null => {
  if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
    return temporaryCaseInfo.info.form;
  }
  return null;
};

export type EditCaseSummaryProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  exitItem: () => void;
  routing: AppRoutesWithCaseAndAction;
  applyTemporaryInfoToCase: CaseUpdater;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
};
// eslint-disable-next-line no-use-before-define
type Props = EditCaseSummaryProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditCaseSummary: React.FC<Props> = ({
  task,
  counselor,
  counselorsHash,
  exitItem,
  connectedCaseState,
  setConnectedCase,
  updateTempInfo,
  applyTemporaryInfoToCase,
  customFormHandlers,
  reactHookFormOptions,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const firstElementRef = useFocus();

  const layout = {
    splitFormAt: 3,
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formDefinition: FormDefinition = [
    {
      name: 'caseStatus',
      label: 'Case Status',
      type: 'select',
      options: [
        { value: 'open', label: 'open' },
        { value: 'closed', label: 'closed' },
      ],
    },
    {
      name: 'date',
      type: 'date-input',
      label: 'Follow Up Date',
    },
    {
      name: 'inImminentPhysicalDanger',
      label: 'Child is in imminent physical danger',
      type: 'checkbox',
    },
    {
      name: 'caseSummary',
      label: 'Case Summary',
      type: 'textarea',
    },
  ];

  const { temporaryCaseInfo } = connectedCaseState;

  // Grab initial values in first render only. If getTemporaryFormContent(temporaryCaseInfo), cherrypick the values using formDefinition, if not build the object with getInitialValue
  const [initialForm] = React.useState(() => {
    if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
      const { caseStatus, caseSummary, date, inImminentPhysicalDanger } = temporaryCaseInfo.info.form;
      return {
        caseStatus,
        caseSummary,
        date,
        inImminentPhysicalDanger,
      };
    }
    return null;
  });

  const methods = useForm(reactHookFormOptions);
  const [openDialog, setOpenDialog] = React.useState(false);

  const { getValues } = methods;

  const [l, r] = React.useMemo(() => {
    const createUpdatedTemporaryFormContent = (payload: CaseItemPayload): EditTemporaryCaseInfo => {
      const isEdited = !isEqual(initialForm, payload);
      if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
        return {
          ...temporaryCaseInfo,
          info: { ...temporaryCaseInfo.info, form: payload },
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
    let { status } = connectedCaseState.connectedCase;
    const form = transformValues(formDefinition)(getTemporaryFormContent(temporaryCaseInfo));
    const now = new Date().toISOString();
    const { workerSid } = getConfig();
    if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
      /*
       * Need to add these to the temporaryCaseInfo instance rather than straight to the applyTemporaryInfoToCase parameter.
       * This way changes are reflected when you go back to the view after an edit
       */
      temporaryCaseInfo.info.updatedAt = now;
      temporaryCaseInfo.info.updatedBy = workerSid;
      info.summary = temporaryCaseInfo.info.form.caseSummary as string;
      info.followUpDate = temporaryCaseInfo.info.form.date as string;
      info.childIsAtRisk = temporaryCaseInfo.info.form.inImminentPhysicalDanger as boolean;
      status = temporaryCaseInfo.info.form.caseStatus as string;

      const newInfo: CaseInfo = applyTemporaryInfoToCase(
        info,
        {
          ...temporaryCaseInfo.info,
          form,
          id: temporaryCaseInfo.info.id ?? uuidV4(),
        },
        temporaryCaseInfo.info.index,
      );
      const updatedCase = await updateCase(id, { status, info: newInfo });
      setConnectedCase(updatedCase, task.taskSid, connectedCaseState.caseHasBeenEdited);
    }
  };

  async function close() {
    if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
      temporaryCaseInfo.isEdited = false;
      exitItem();
    } else {
      exitItem();
    }
  }

  async function saveAndLeave() {
    await save();
    close();
  }

  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(`Case: EditCaseSummary`, () => {
    window.alert(strings['Error-Form']);
    if (openDialog) setOpenDialog(false);
  });

  const { added, addingCounsellorName, updated, updatingCounsellorName } = isEditTemporaryCaseInfo(temporaryCaseInfo)
    ? temporaryCaseInfoHistory(temporaryCaseInfo, counselorsHash)
    : { added: new Date(), addingCounsellorName: counselor, updated: undefined, updatingCounsellorName: undefined };

  const checkForEdits = () => {
    if (isEditTemporaryCaseInfo(temporaryCaseInfo) && temporaryCaseInfo.isEdited) {
      setOpenDialog(true);
    } else close();
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
          <StyledNextStepButton
            data-testid="Case-AddEditItemScreen-SaveItem"
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

export default connect(mapStateToProps, mapDispatchToProps)(EditCaseSummary);
