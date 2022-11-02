/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { CSAMReportContainer, CSAMReportLayout, BoldDescriptionText } from '../../styles/CSAMReport';
import { definitionObjectForCLC } from './CSAMReportFormDefinition';
import { RequiredAsterisk } from '../common/forms/formGenerators';

type Props = {
  formElements: { [k in keyof typeof definitionObjectForCLC]: JSX.Element };
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
};

const CSAMCLCReportFormScreen: React.FC<Props> = ({ formElements, counselor, onClickClose, onSendReport }) => (
  <CSAMReportContainer data-testid="CSAMCLCReportForm-FormScreen">
    <CSAMReportLayout>
      <ActionHeader
        addedForCSAMCLC={new Date()}
        titleTemplate="CSAMCLCReportForm-Header"
        onClickClose={onClickClose}
        addingCounsellor={counselor}
      />

      {/** Website details */}
      <Box marginTop="20px" marginBottom="5px">
        <BoldDescriptionText>
          <Template code="CSAMCLCReportForm-ChildAge" />
          &nbsp;
          <RequiredAsterisk />
        </BoldDescriptionText>
        <Box padding="15px 15px 15px 20px">{formElements.childAge}</Box>
      </Box>

      {/** Conditional part of the form only shown if contact is not anon */}
      <Box marginTop="20px" marginBottom="5px">
        <BoldDescriptionText>
          <Template code="CSAMCLCReportForm-AgeVerified" />
          &nbsp;
          <RequiredAsterisk />
        </BoldDescriptionText>
        <Box padding="15px 15px 15px 20px">{formElements.ageVerified}</Box>
      </Box>
    </CSAMReportLayout>

    <BottomButtonBar>
      <Box marginRight="15px">
        <StyledNextStepButton secondary roundCorners onClick={onClickClose}>
          <Template code="BottomBar-Cancel" />
        </StyledNextStepButton>
      </Box>
      <StyledNextStepButton roundCorners onClick={onSendReport} data-testid="CSAMCLCReport-SubmitButton">
        <Template code="BottomBar-CreateLink" />
      </StyledNextStepButton>
    </BottomButtonBar>
  </CSAMReportContainer>
);

CSAMCLCReportFormScreen.displayName = 'CSAMCLCReportFormScreen';

export default CSAMCLCReportFormScreen;
