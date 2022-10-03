/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import { v4 as uuidV4 } from 'uuid';
import React, { useMemo } from 'react';
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
import { createFormFromDefinition, disperseInputs, splitAt } from '../common/forms/formGenerators';
import type { CaseInfo, CustomITask, StandaloneITask } from '../../types/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import {
  EditTemporaryCaseInfo,
  isEditTemporaryCaseInfo,
  TemporaryCaseInfo,
  temporaryCaseInfoHistory,
} from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import { upsertCaseSectionItemUsingSectionName } from '../../states/case/sections/update';

type CaseItemPayload = { [key: string]: string | boolean };

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
  definitionVersion,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const { temporaryCaseInfo } = connectedCaseState;
  const editTemporaryCaseInfo = temporaryCaseInfo as EditTemporaryCaseInfo;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const firstElementRef = useFocus();

  const formDefinition: FormDefinition = useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    try {
      let caseStatusOptions = [];
      if (definitionVersion) {
        const caseStatusList = Object.values(definitionVersion.caseStatus);
        const currentStatusItem = caseStatusList.find(cs => cs.value === connectedCaseState.prevStatus);
        const availableStatusTransitions: string[] = currentStatusItem
          ? [...(currentStatusItem.transitions ?? []), currentStatusItem.value]
          : [];
        caseStatusOptions = caseStatusList.filter(option => availableStatusTransitions.includes(option.value));
      }
      return [
        {
          name: 'caseStatus',
          label: 'Case-CaseStatus',
          type: 'select',
          options: caseStatusOptions,
        },
        {
          name: 'date',
          type: 'date-input',
          label: 'Case-CaseDetailsFollowUpDate',
        },
        {
          name: 'inImminentPhysicalDanger',
          label: 'Case-ChildIsAtRisk',
          type: 'checkbox',
        },
        {
          name: 'caseSummary',
          label: 'SectionName-CaseSummary',
          type: 'textarea',
        },
      ];
    } catch (e) {
      console.error('Failed to render edit case summary form', e);
      return [];
    }
  }, [connectedCaseState.prevStatus, definitionVersion]);

  // Grab initial values in first render only. If getTemporaryFormContent(temporaryCaseInfo), cherrypick the values using formDefinition, if not build the object with getInitialValue
  const [initialForm] = React.useState(() => {
    const { caseStatus, caseSummary, date, inImminentPhysicalDanger } = editTemporaryCaseInfo.info.form;
    return {
      caseStatus,
      caseSummary,
      date,
      inImminentPhysicalDanger,
    };
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const methods = useForm();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [openDialog, setOpenDialog] = React.useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { getValues } = methods;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [l, r] = React.useMemo(() => {
    const createUpdatedTemporaryFormContent = (payload: CaseItemPayload): EditTemporaryCaseInfo => {
      const isEdited = !isEqual(initialForm, payload);

      return {
        ...editTemporaryCaseInfo,
        info: { ...editTemporaryCaseInfo.info, form: payload },
        isEdited,
      };
    };

    const updateCallBack = () => {
      const formValues = getValues();
      updateTempInfo(createUpdatedTemporaryFormContent(formValues), task.taskSid);
    };
    const generatedForm = createFormFromDefinition(formDefinition)([])(initialForm, firstElementRef)(updateCallBack);
    return splitAt(3)(disperseInputs(7)(generatedForm));
  }, [formDefinition, initialForm, firstElementRef, editTemporaryCaseInfo, getValues, updateTempInfo, task.taskSid]);

  if (!isEditTemporaryCaseInfo(temporaryCaseInfo)) {
    return null;
  }

  const save = async () => {
    const { info, id } = connectedCaseState.connectedCase;
    let { status } = connectedCaseState.connectedCase;
    const form = transformValues(formDefinition)(getTemporaryFormContent(temporaryCaseInfo));
    const now = new Date().toISOString();
    const { workerSid } = getConfig();
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

    const applyTemporaryInfoToCase = upsertCaseSectionItemUsingSectionName('caseSummary', 'caseSummary');

    const newInfo: CaseInfo = applyTemporaryInfoToCase(info, {
      ...temporaryCaseInfo.info,
      form,
      id: temporaryCaseInfo.info.id ?? uuidV4(),
    });
    const updatedCase = await updateCase(id, { status, info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, connectedCaseState.caseHasBeenEdited);
  };

  const close = () => {
    temporaryCaseInfo.isEdited = false;
    exitItem();
  };

  const saveAndLeave = async () => {
    await save();
    close();
  };

  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(`Case: EditCaseSummary`, () => {
    window.alert(strings['Error-Form']);
    if (openDialog) setOpenDialog(false);
  });

  const { added, addingCounsellorName, updated, updatingCounsellorName } = isEditTemporaryCaseInfo(temporaryCaseInfo)
    ? temporaryCaseInfoHistory(temporaryCaseInfo, counselorsHash)
    : { added: new Date(), addingCounsellorName: counselor, updated: undefined, updatingCounsellorName: undefined };

  const checkForEdits = () => {
    if (temporaryCaseInfo.isEdited) {
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
