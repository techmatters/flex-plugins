/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import { v4 as uuidV4 } from 'uuid';
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { useForm, FormProvider, SubmitErrorHandler, FieldValues } from 'react-hook-form';
import type { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import {
  Box,
  BottomButtonBar,
  BottomButtonBarHeight,
  Container,
  TwoColumnLayout,
  ColumnarBlock,
  StyledNextStepButton,
} from '../../styles/HrmStyles';
import { CaseActionLayout, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { namespace, connectedCaseBase, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import { transformValues } from '../../services/ContactService';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import {
  createFormFromDefinition,
  createStateItem,
  disperseInputs,
  splitInHalf,
  splitAt,
  CustomHandlers,
} from '../common/forms/formGenerators';
import type { CustomITask, StandaloneITask, CaseInfo, CaseItemEntry } from '../../types/types';
import { AppRoutesWithCase } from '../../states/routing/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import { AddTemporaryCaseInfo, CaseUpdater, isAddTemporaryCaseInfo, TemporaryCaseInfo } from '../../states/case/types';

type CaseItemPayload = { [key: string]: string | boolean };

const UNSUPPORTED_TEMPORARY_INFO_TYPE_MESSAGE =
  'Only AddTemporaryCaseInfo and EditTemporaryCaseInfo temporary case data types are supported by this component.';

const getTemporaryFormContent = (temporaryCaseInfo: TemporaryCaseInfo): CaseItemPayload | null => {
  if (isAddTemporaryCaseInfo(temporaryCaseInfo)) {
    return temporaryCaseInfo.info;
  }
  return null;
};

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
  route: AppRoutesWithCase['route'];
  itemType: string;
  formDefinition: FormDefinition;
  layout: LayoutDefinition;
  applyTemporaryInfoToCase: CaseUpdater;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
};
// eslint-disable-next-line no-use-before-define
type Props = AddEditCaseItemProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddEditCaseItem: React.FC<Props> = ({
  task,
  counselor,
  onClickClose,
  connectedCaseState,
  route,
  itemType,
  setConnectedCase,
  updateTempInfo,
  changeRoute,
  formDefinition,
  layout,
  applyTemporaryInfoToCase,
  customFormHandlers,
  reactHookFormOptions,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const firstElementRef = useFocus();

  const { temporaryCaseInfo } = connectedCaseState;

  const [initialForm] = React.useState(getTemporaryFormContent(temporaryCaseInfo) ?? {}); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm(reactHookFormOptions);

  const [l, r] = React.useMemo(() => {
    const createUpdatedTemporaryFormContent = (payload: CaseItemPayload): AddTemporaryCaseInfo => {
      if (isAddTemporaryCaseInfo(temporaryCaseInfo)) {
        return {
          ...temporaryCaseInfo,
          info: payload,
        };
      }
      throw new Error(UNSUPPORTED_TEMPORARY_INFO_TYPE_MESSAGE);
    };

    const updateCallBack = () => {
      const formValues = methods.getValues();
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
    layout.splitFormAt,
    methods,
    task.taskSid,
    updateTempInfo,
    temporaryCaseInfo,
    customFormHandlers,
  ]);

  const save = async shouldStayInForm => {
    const { info, id } = connectedCaseState.connectedCase;
    const form = transformValues(formDefinition)(getTemporaryFormContent(temporaryCaseInfo));
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newItem: CaseItemEntry = { form, createdAt, twilioWorkerId: workerSid, id: uuidV4() };
    const newInfo: CaseInfo = applyTemporaryInfoToCase(info, newItem, undefined);

    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);
    if (shouldStayInForm && isAddTemporaryCaseInfo(temporaryCaseInfo)) {
      const blankForm = formDefinition.reduce(createStateItem, {});
      methods.reset(blankForm); // Resets the form.
      updateTempInfo({ screen: temporaryCaseInfo.screen, info: {} }, task.taskSid);
      changeRoute({ route, subroute: temporaryCaseInfo.screen }, task.taskSid);
    }
  };

  async function saveAndStay() {
    await save(true);
  }

  async function saveAndLeave() {
    await save(false);
    onClickClose();
  }
  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(`Case: Add ${itemType}`, () => {
    window.alert(strings['Error-Form']);
  });

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader titleTemplate={`Case-Add${itemType}`} onClickClose={onClickClose} counselor={counselor} />
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
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <Box marginRight="15px">
            <StyledNextStepButton
              data-testid="Case-AddEditItemScreen-SaveAndAddAnotherItem"
              secondary
              roundCorners
              onClick={methods.handleSubmit(saveAndStay, onError)}
            >
              <Template code={`BottomBar-SaveAndAddAnother${itemType}`} />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton
            data-testid="Case-AddEditItemScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(saveAndLeave, onError)}
          >
            <Template code={`BottomBar-Save${itemType}`} />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddEditCaseItem.displayName = 'AddEditCaseItem';

const mapStateToProps = (state: RootState, ownProps: AddEditCaseItemProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEditCaseItem);
