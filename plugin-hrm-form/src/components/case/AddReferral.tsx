/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { useForm, FormProvider, SubmitErrorHandler, FieldValues } from 'react-hook-form';

import ActionHeader from './ActionHeader';
import {
  Box,
  StyledNextStepButton,
  BottomButtonBar,
  BottomButtonBarHeight,
  TwoColumnLayout,
  ColumnarBlock,
  Container,
} from '../../styles/HrmStyles';
import { CaseActionLayout, CaseActionFormContainer } from '../../styles/case';
import { namespace, connectedCaseBase, routingBase, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { updateCase } from '../../services/CaseService';
import { createFormFromDefinition, disperseInputs, splitInHalf } from '../common/forms/formGenerators';
import type { DefinitionVersion } from '../common/forms/types';
import { transformValues } from '../../services/ContactService';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { getConfig } from '../../HrmFormPlugin';
import useFocus from '../../utils/useFocus';
import { recordFormValidationError, recordingErrorHandler } from '../../fullStory';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddReferral: React.FC<Props> = ({
  task,
  counselor,
  connectedCaseState,
  definitionVersion,
  onClickClose,
  updateTempInfo,
  setConnectedCase,
}) => {
  const firstElementRef = useFocus();

  const { connectedCase, temporaryCaseInfo } = connectedCaseState;
  const { ReferralForm } = definitionVersion.caseForms;

  const init = temporaryCaseInfo && temporaryCaseInfo.screen === 'add-referral' ? temporaryCaseInfo.info : {};
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const referral = methods.getValues();
      updateTempInfo({ screen: 'add-referral', info: referral }, task.taskSid);
    };

    const generatedForm = createFormFromDefinition(ReferralForm)([])(initialForm, firstElementRef)(updateCallBack);

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [ReferralForm, initialForm, firstElementRef, methods, task.taskSid, updateTempInfo]);

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-referral') return null;

  const handleSaveReferral = async () => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-referral') return;

    const { info, id } = connectedCase;
    const referral = transformValues(ReferralForm)(temporaryCaseInfo.info);
    const referrals = info && info.referrals ? [...info.referrals, referral] : [referral];
    const newInfo = info ? { ...info, referrals } : { referrals };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);
    updateTempInfo({ screen: 'add-referral', info: null }, task.taskSid);
    onClickClose();
  };

  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler('Case: Add Referral', () => {
    window.alert(strings['Error-Form']);
  });

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader titleTemplate="Case-AddReferral" onClickClose={onClickClose} counselor={counselor} />
          <Container>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>{l}</ColumnarBlock>
                <ColumnarBlock>{r}</ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>
        </CaseActionFormContainer>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton
            data-testid="Case-AddReferralScreen-SaveReferral"
            roundCorners
            onClick={methods.handleSubmit(handleSaveReferral, onError)}
          >
            <Template code="BottomBar-SaveReferral" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddReferral.displayName = 'AddReferral';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState = state[namespace][connectedCaseBase];
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];
  const { route } = state[namespace][routingBase].tasks[ownProps.task.taskSid];

  return { connectedCaseState, route };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddReferral);
