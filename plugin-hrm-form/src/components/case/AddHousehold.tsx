/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { useForm, FormProvider, SubmitErrorHandler, FieldValues } from 'react-hook-form';
import type { DefinitionVersion } from 'hrm-form-definitions';

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
import { namespace, connectedCaseBase, routingBase, RootState } from '../../states';
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
} from '../common/forms/formGenerators';
import type { CustomITask, StandaloneITask, Household as tHousehold, HouseholdEntry } from '../../types/types';
import { AppRoutesWithCase, NewCaseSubroutes } from '../../states/routing/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import { TemporaryCaseInfo } from '../../states/case/types';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
  route: AppRoutesWithCase['route'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddHousehold: React.FC<Props> = ({
  task,
  counselor,
  onClickClose,
  connectedCaseState,
  route,
  definitionVersion,
  setConnectedCase,
  updateTempInfo,
  changeRoute,
}) => {
  const firstElementRef = useFocus();

  const { temporaryCaseInfo } = connectedCaseState;
  const { HouseholdForm } = definitionVersion.caseForms;
  const { layoutVersion } = definitionVersion;

  const getTemporaryFormContent = (): tHousehold | null => {
    switch (temporaryCaseInfo?.screen) {
      case NewCaseSubroutes.AddHousehold:
        return temporaryCaseInfo.info;
      case NewCaseSubroutes.EditHousehold:
        return temporaryCaseInfo.info.household;
      default:
        return null;
    }
  };

  const createUpdatedTemporaryFormContent = (household: tHousehold): TemporaryCaseInfo => {
    switch (temporaryCaseInfo?.screen) {
      case NewCaseSubroutes.AddHousehold:
        temporaryCaseInfo.info = household;
        return {
          ...temporaryCaseInfo,
          info: household,
        };
      case NewCaseSubroutes.EditHousehold:
        return {
          ...temporaryCaseInfo,
          info: {
            ...temporaryCaseInfo?.info,
            household,
          },
        };
      default:
        return null;
    }
  };

  const getTemporaryIndex = (): number | null =>
    temporaryCaseInfo?.screen === NewCaseSubroutes.EditHousehold ? temporaryCaseInfo.info.index : null;

  const isEditingExistingItem = (): boolean => temporaryCaseInfo?.screen === NewCaseSubroutes.EditHousehold;

  const init = getTemporaryFormContent() ?? {};
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const household = methods.getValues();
      updateTempInfo(createUpdatedTemporaryFormContent(household), task.taskSid);
    };

    const generatedForm = createFormFromDefinition(HouseholdForm)([])(initialForm, firstElementRef)(updateCallBack);

    if (layoutVersion.case.households.splitFormAt)
      return splitAt(layoutVersion.case.households.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [
    HouseholdForm,
    initialForm,
    firstElementRef,
    layoutVersion.case.households.splitFormAt,
    methods,
    task.taskSid,
    updateTempInfo,
  ]);

  const saveHousehold = async shouldStayInForm => {
    const temporaryItem = getTemporaryFormContent();
    const index = getTemporaryIndex();
    if (!temporaryItem) return;

    const { info, id } = connectedCaseState.connectedCase;
    const household = transformValues(HouseholdForm)(temporaryItem);
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newHousehold = { household, createdAt, twilioWorkerId: workerSid };
    const households: HouseholdEntry[] = [...(info?.households ?? [])];
    if (typeof index === 'number') {
      households[index] = newHousehold;
    } else {
      households.push(newHousehold);
    }

    const newInfo = info ? { ...info, households } : { households };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);
    if (shouldStayInForm) {
      const blankForm = HouseholdForm.reduce(createStateItem, {});
      methods.reset(blankForm); // Resets the form.
      updateTempInfo({ screen: NewCaseSubroutes.AddHousehold, info: {} }, task.taskSid);
      changeRoute({ route, subroute: NewCaseSubroutes.AddHousehold }, task.taskSid);
    }
  };

  async function saveHouseholdAndStay() {
    await saveHousehold(true);
  }

  async function saveHouseholdAndLeave() {
    await saveHousehold(false);
    onClickClose();
  }
  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler('Case: Add Household', () => {
    window.alert(strings['Error-Form']);
  });

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader
            titleTemplate={isEditingExistingItem() ? 'Case-EditHousehold' : 'Case-AddHousehold'}
            onClickClose={onClickClose}
            counselor={counselor}
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
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          {!isEditingExistingItem() && (
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="Case-AddHouseholdScreen-SaveAndAddAnotherHousehold"
                secondary
                roundCorners
                onClick={methods.handleSubmit(saveHouseholdAndStay, onError)}
              >
                <Template code="BottomBar-SaveAndAddAnotherHousehold" />
              </StyledNextStepButton>
            </Box>
          )}
          <StyledNextStepButton
            data-testid="Case-AddHouseholdScreen-SaveHousehold"
            roundCorners
            onClick={methods.handleSubmit(saveHouseholdAndLeave, onError)}
          >
            <Template code="BottomBar-SaveHousehold" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddHousehold.displayName = 'AddHousehold';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(AddHousehold);
