/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';

import RequiredAsterisk from '../RequiredAsterisk';
import ActionHeader from './ActionHeader';
import {
  Flex,
  Box,
  Row,
  StyledNextStepButton,
  BottomButtonBar,
  FormLabel,
  FormInput,
  FormSelect,
  FormSelectWrapper,
  FormOption,
} from '../../styles/HrmStyles';
import { CaseActionContainer } from '../../styles/case';
import { namespace, connectedCaseBase, routingBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { updateCase } from '../../services/CaseService';
import { blankReferral } from '../../types/types';
import { ValidationType } from '../../states/ContactFormStateFactory';
import { referredToOptions } from '../SelectOptions';

type OwnProps = {
  task: ITask;
  counselor: string;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddReferral: React.FC<Props> = ({
  task,
  counselor,
  connectedCaseState,
  route,
  onClickClose,
  updateTempInfo,
  changeRoute,
  setConnectedCase,
}) => {
  const { connectedCase, temporaryCaseInfo } = connectedCaseState;

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-referral') return null;

  const { info: referralFormInfo } = temporaryCaseInfo;

  const handleChange = (field, value) =>
    updateTempInfo({ screen: 'add-referral', info: { ...referralFormInfo, [field]: value } }, task.taskSid);

  const handleSaveReferral = async () => {
    const { info, id } = connectedCase;
    const newReferral = referralFormInfo;
    const referrals = info && info.referrals ? [...info.referrals, newReferral] : [newReferral];
    const newInfo = info ? { ...info, referrals } : { referrals };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid);
    updateTempInfo({ screen: 'add-referral', info: blankReferral }, task.taskSid);
    changeRoute({ route }, task.taskSid);
  };

  const requiredField = {
    validation: [ValidationType.REQUIRED],
  };

  const isSaveDisabled = Boolean(!referralFormInfo || !referralFormInfo.date || !referralFormInfo.referredTo);

  return (
    <CaseActionContainer>
      <Box height="100%" paddingTop="20px" paddingLeft="30px" paddingRight="10px">
        <ActionHeader titleTemplate="Case-AddReferral" onClickClose={onClickClose} counselor={counselor} />
        <Flex justifyContent="space-between" marginTop="25px">
          <Flex flexDirection="column">
            <Box marginBottom="25px">
              <FormLabel htmlFor="date">
                <Row>
                  <Box marginBottom="8px">
                    <Template code="Case-AddReferralDate" />
                    <RequiredAsterisk field={requiredField} />
                  </Box>
                </Row>
                <FormInput
                  data-testid="Case-AddReferralScreen-Date"
                  type="date"
                  id="date"
                  name="date"
                  onChange={e => handleChange('date', e.target.value)}
                />
              </FormLabel>
            </Box>
            <FormLabel htmlFor="referredTo">
              <Row>
                <Box marginBottom="8px">
                  <Template code="Case-AddReferralReferredTo" />
                  <RequiredAsterisk field={requiredField} />
                </Box>
              </Row>
              <FormSelectWrapper>
                <FormSelect
                  data-testid="Case-AddReferralScreen-ReferredTo"
                  id="referredTo"
                  name="referredTo"
                  onChange={e => handleChange('referredTo', e.target.value)}
                >
                  {['', ...referredToOptions].map(option => (
                    <FormOption key={`referredToOption-${option}`} value={option} isEmptyValue={!option}>
                      {option}
                    </FormOption>
                  ))}
                </FormSelect>
              </FormSelectWrapper>
            </FormLabel>
          </Flex>
          <Box marginRight="20px">
            <FormLabel htmlFor="comments">
              <Row>
                <Box marginBottom="8px">
                  <Template code="Case-AddReferralComments" />
                </Box>
              </Row>
              <textarea
                data-testid="Case-AddReferralScreen-Comments"
                id="comments"
                name="comments"
                onChange={e => handleChange('comments', e.target.value)}
                rows={30}
                style={{ width: '289px' }}
              />
            </FormLabel>
          </Box>
        </Flex>
      </Box>
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
          onClick={handleSaveReferral}
          disabled={isSaveDisabled}
        >
          <Template code="BottomBar-SaveReferral" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseActionContainer>
  );
};

AddReferral.displayName = 'AddReferral';

const mapStateToProps = (state, ownProps: OwnProps) => {
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
