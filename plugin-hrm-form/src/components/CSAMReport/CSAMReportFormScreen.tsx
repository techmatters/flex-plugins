/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { CSAMReportContainer, CSAMReportLayout, BoldDescriptionText, RegularText } from '../../styles/CSAMReport';
import { definitionObject, childDefinitionObject } from './CSAMReportFormDefinition';
import { RequiredAsterisk } from '../common/forms/formGenerators';

type Props = {
  counselorCSAMformElements: { [k in keyof typeof definitionObject]: JSX.Element };
  childCSAMformElements: { [k in keyof typeof childDefinitionObject]: JSX.Element };
  renderContactDetails: boolean;
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
  csamType: 'self-report' | 'counsellor-report';
};

const CSAMReportFormScreen: React.FC<Props> = ({
  counselorCSAMformElements,
  childCSAMformElements,
  renderContactDetails,
  counselor,
  onClickClose,
  onSendReport,
  csamType,
}) => (
  <CSAMReportContainer data-testid="CSAMReport-FormScreen">
    {csamType === 'self-report' && (
      <CSAMReportLayout>
        <ActionHeader
          added={new Date()}
          codeTemplate="CSAMCLC-ActionHeaderAdded"
          titleTemplate="CSAMCLCReportForm-Header"
          onClickClose={onClickClose}
          addingCounsellor={counselor}
          space={`\xa0\xa0`}
        />

        {/** Website details */}
        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText>
            <Template code="CSAMCLCReportForm-ChildAge" />
            &nbsp;
            <RequiredAsterisk />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{childCSAMformElements.childAge}</Box>
        </Box>

        {/** Conditional part of the form only shown if contact is not anon */}
        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText>
            <Template code="CSAMCLCReportForm-AgeVerified" />
            &nbsp;
            <RequiredAsterisk />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{childCSAMformElements.ageVerified}</Box>
        </Box>
      </CSAMReportLayout>
    )}

    {csamType === 'counsellor-report' && (
      <CSAMReportLayout>
        <ActionHeader titleTemplate="CSAMReportForm-Header" onClickClose={onClickClose} addingCounsellor={counselor} />

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
          {counselorCSAMformElements.webAddress}
          {counselorCSAMformElements.description}
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
        <Box padding="15px 15px 0 15px">{counselorCSAMformElements.anonymous}</Box>

        {/** Conditional part of the form only shown if contact is not anon */}
        {renderContactDetails && (
          <Box marginTop="20px" marginBottom="5px">
            <RegularText>
              <Template code="CSAMReportForm-ContactDetailsInfo" />
            </RegularText>
            <Box padding="15px 15px 15px 20px">
              {counselorCSAMformElements.firstName}
              {counselorCSAMformElements.lastName}
              {counselorCSAMformElements.email}
            </Box>
          </Box>
        )}
      </CSAMReportLayout>
    )}

    <BottomButtonBar>
      <Box marginRight="15px">
        <StyledNextStepButton secondary roundCorners onClick={onClickClose}>
          <Template code="BottomBar-Cancel" />
        </StyledNextStepButton>
      </Box>
      <StyledNextStepButton
        roundCorners
        onClick={onSendReport}
        data-testid={csamType === 'self-report' ? 'CSAMCLCReport-SubmitButton' : 'CSAMReport-SubmitButton'}
      >
        <Template code={csamType === 'self-report' ? 'BottomBar-CreateLink' : 'BottomBar-SendReport'} />
      </StyledNextStepButton>
    </BottomButtonBar>
  </CSAMReportContainer>
);

CSAMReportFormScreen.displayName = 'CSAMReportFormScreen';

export default CSAMReportFormScreen;
