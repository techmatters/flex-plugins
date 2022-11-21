/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import {
  CSAMReportContainer,
  CSAMReportLayout,
  BoldDescriptionText,
  RegularText,
  StyledOpenInNew,
} from '../../styles/CSAMReport';
import { definitionObject, childDefinitionObject } from './CSAMReportFormDefinition';
import { RequiredAsterisk } from '../common/forms/formGenerators';

type Props = {
  counsellorFormElements?: { [k in keyof typeof definitionObject]: JSX.Element };
  childFormElements?: { [k in keyof typeof childDefinitionObject]: JSX.Element };
  renderContactDetails?: boolean;
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
  csamType: 'child-form' | 'counsellor-form';
};

const CSAMReportFormScreen: React.FC<Props> = ({
  counsellorFormElements,
  childFormElements,
  renderContactDetails,
  counselor,
  onClickClose,
  onSendReport,
  csamType,
}) => (
  <CSAMReportContainer data-testid="CSAMReport-FormScreen">
    {csamType === 'child-form' && (
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
          <Box padding="15px 15px 15px 20px">{childFormElements.childAge}</Box>
        </Box>

        {/** Conditional part of the form only shown if contact is not anon */}
        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText>
            <Template code="CSAMCLCReportForm-AgeVerified" />
            &nbsp;
            <RequiredAsterisk />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{childFormElements.ageVerified}</Box>
        </Box>
      </CSAMReportLayout>
    )}

    {csamType === 'counsellor-form' && (
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
          {counsellorFormElements.webAddress}
          {counsellorFormElements.description}
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
        <Box padding="15px 15px 0 15px">{counsellorFormElements.anonymous}</Box>

        {/** Conditional part of the form only shown if contact is not anon */}
        {renderContactDetails && (
          <Box marginTop="20px" marginBottom="5px">
            <RegularText>
              <Template code="CSAMReportForm-ContactDetailsInfo" />
              <StyledOpenInNew fontSize="inherit" />
            </RegularText>
            <Box padding="15px 15px 15px 20px">
              {counsellorFormElements.firstName}
              {counsellorFormElements.lastName}
              {counsellorFormElements.email}
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
        data-testid={csamType === 'child-form' ? 'CSAMCLCReport-SubmitButton' : 'CSAMReport-SubmitButton'}
      >
        <Template code={csamType === 'child-form' ? 'BottomBar-CreateLink' : 'BottomBar-SendReport'} />
      </StyledNextStepButton>
    </BottomButtonBar>
  </CSAMReportContainer>
);

CSAMReportFormScreen.displayName = 'CSAMReportFormScreen';

export default CSAMReportFormScreen;
