/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';
import Close from '@material-ui/icons/Close';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, HiddenText, Row } from '../../styles/HrmStyles';
import { StyledNextStepButton, HeaderCloseButton } from '../../styles/buttons';
import {
  BoldDescriptionText,
  CSAMReportContainer,
  CSAMReportLayout,
  OpenInNewIcon,
  RegularText,
} from '../../styles/CSAMReport';
import { definitionObject, generateCSAMFormElement, initialValues } from './CSAMReportFormDefinition';
import { CounselorCSAMReportForm } from '../../states/csam-report/types';
import useFocus from '../../utils/useFocus';
import { CaseActionTitle } from '../../styles/case';

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

  const focusElementRef = useFocus();

  return (
    <CSAMReportContainer data-testid="CSAMReport-FormScreen">
      <CSAMReportLayout>
        {
          // TODO: Replace with NavigableContainer once we use standard routing for CSAM reports
        }
        <Row style={{ width: '100%' }}>
          <CaseActionTitle style={{ marginTop: 'auto' }}>
            <Template code="Contact-ExternalReport" />
          </CaseActionTitle>
          <HeaderCloseButton
            onClick={onClickClose}
            data-testid="Case-CloseCross"
            ref={ref => {
              focusElementRef.current = ref;
            }}
          >
            <HiddenText>
              <Template code="Case-CloseButton" />
            </HiddenText>
            <Close />
          </HeaderCloseButton>
        </Row>
        <ActionHeader addingCounsellor={counselor} focusCloseButton={true} />

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
          <StyledNextStepButton secondary="true" roundCorners onClick={onClickClose}>
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
