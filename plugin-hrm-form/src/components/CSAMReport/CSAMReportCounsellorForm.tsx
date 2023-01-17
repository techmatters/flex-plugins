/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import {
  BoldDescriptionText,
  CSAMReportContainer,
  CSAMReportLayout,
  OpenInNewIcon,
  RegularText,
} from '../../styles/CSAMReport';
import { definitionObject, generateCSAMFormElement, initialValues } from './CSAMReportFormDefinition';
import { CounselorCSAMReportForm } from '../../states/csam-report/types';

type Props = {
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
  update: (formValues: CounselorCSAMReportForm) => void;
  formValues: CounselorCSAMReportForm;
  methods: ReturnType<typeof useForm>;
};

const CSAMReportCounsellorForm: React.FC<Props> = ({
  counselor,
  onClickClose,
  onSendReport,
  update,
  formValues,
  methods,
}) => {
  const generateCounselorFormElement = generateCSAMFormElement(initialValues, formValues, update, methods);
  return (
    <CSAMReportContainer data-testid="CSAMReport-FormScreen">
      <CSAMReportLayout>
        <ActionHeader
          titleTemplate="CSAMReportForm-Header"
          onClickClose={onClickClose}
          addingCounsellor={counselor}
          focusCloseButton={true}
        />

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
          {generateCounselorFormElement(definitionObject.webAddress)}
          {generateCounselorFormElement(definitionObject.description)}
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
        <Box padding="15px 15px 0 15px">{generateCounselorFormElement(definitionObject.anonymous)}</Box>

        {/** Conditional part of the form only shown if contact is not anon */}
        {formValues.anonymous === 'non-anonymous' && (
          <Box marginTop="20px" marginBottom="5px">
            <RegularText>
              <Template code="CSAMReportForm-ContactDetailsInfo" />
              <OpenInNewIcon fontSize="inherit" />
            </RegularText>
            <Box padding="15px 15px 15px 20px">
              {generateCounselorFormElement(definitionObject.firstName)}
              {generateCounselorFormElement(definitionObject.lastName)}
              {generateCounselorFormElement(definitionObject.email)}
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
};

CSAMReportCounsellorForm.displayName = 'CSAMReportCounsellorForm';

export default CSAMReportCounsellorForm;
