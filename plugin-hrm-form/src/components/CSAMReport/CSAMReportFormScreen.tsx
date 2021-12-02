/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { CSAMReportContainer, CSAMReportLayout, BoldDescriptionText, RegularText } from '../../styles/CSAMReportForm';
import { definitionObject } from './CSAMReportFormDefinition';

type Props = {
  formElements: { [k in keyof typeof definitionObject]: JSX.Element };
  renderContactDetails: boolean;
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
};

const CSAMReportFormScreen: React.FC<Props> = ({
  formElements,
  renderContactDetails,
  counselor,
  onClickClose,
  onSendReport,
}) => (
  <CSAMReportContainer data-testid="CSAMReport-FormScreen">
    <CSAMReportLayout>
      <ActionHeader titleTemplate="CSAMReportForm-Header" onClickClose={onClickClose} counselor={counselor} />

      {/** Website details */}
      <Box marginTop="20px" marginBottom="5px">
        <BoldDescriptionText>
          <Template code="CSAMReportForm-WebsiteDetails" />
        </BoldDescriptionText>
      </Box>
      <RegularText>
        <Template code="CSAMReportForm-WebsiteDetailsDescription" />
      </RegularText>
      <Box padding="15px 15px 15px 20px">
        {formElements.webAddress}
        {formElements.description}
      </Box>

      {/** Contact details */}
      <Box marginTop="20px" marginBottom="5px">
        <BoldDescriptionText>
          <Template code="CSAMReportForm-ContactDetails" />
        </BoldDescriptionText>
      </Box>
      <RegularText>
        <Template code="CSAMReportForm-ContactDetailsDescription" />
      </RegularText>
      <Box padding="15px 15px 15px 20px">{formElements.anonymous}</Box>

      {/** Conditional part of the form only shown if contact is not anon */}
      {renderContactDetails && (
        <Box marginTop="20px" marginBottom="5px">
          <RegularText>
            <Template code="CSAMReportForm-ContactDetailsInfo" />
          </RegularText>
          <Box padding="15px 15px 15px 20px">
            {formElements.firstName}
            {formElements.lastName}
            {formElements.email}
          </Box>
        </Box>
      )}
    </CSAMReportLayout>

    <BottomButtonBar>
      <Box marginRight="15px">
        <StyledNextStepButton secondary roundCorners onClick={onClickClose}>
          <Template code="BottomBar-Cancel" />
        </StyledNextStepButton>
      </Box>
      <StyledNextStepButton roundCorners onClick={onSendReport} data-testid="CSAMReport-SubmitButton">
        <Template code="BottomBar-SendReport" />
      </StyledNextStepButton>
    </BottomButtonBar>
  </CSAMReportContainer>
);

CSAMReportFormScreen.displayName = 'CSAMReportFormScreen';

export default CSAMReportFormScreen;
