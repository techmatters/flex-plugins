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
import { BoldDescriptionText, CSAMReportContainer, CSAMReportLayout } from '../../styles/CSAMReport';
import { childDefinitionObject, childInitialValues, generateCSAMFormElement } from './CSAMReportFormDefinition';
import { RequiredAsterisk } from '../common/forms/formGenerators';
import { ChildCSAMReportForm } from '../../states/csam-report/types';
import useFocus from '../../utils/useFocus';
import { CaseActionTitle } from '../../styles/case';

type Props = {
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
  update: (formValues: ChildCSAMReportForm) => void;
  formValues: ChildCSAMReportForm;
  methods: ReturnType<typeof useForm>;
};

const CSAMReportChildForm: React.FC<Props> = ({
  counselor,
  onClickClose,
  onSendReport,
  update,
  formValues,
  methods,
}) => {
  const generateChildFormElement = generateCSAMFormElement(childInitialValues, formValues, update, methods);

  const focusElementRef = useFocus();

  return (
    <CSAMReportContainer style={{ padding: '5px' }} data-testid="CSAMReport-FormScreen">
      <CSAMReportLayout>
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
        <ActionHeader
          added={new Date()}
          codeTemplate="CSAMCLC-ActionHeaderAdded"
          addingCounsellor={counselor}
          focusCloseButton={true}
        />

        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText style={{ color: '#192b33' }}>
            <Template code="CSAMCLCReportForm-ChildAge" />
            &nbsp;
            <RequiredAsterisk />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{generateChildFormElement(childDefinitionObject.childAge)}</Box>
        </Box>

        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText style={{ color: '#192b33' }}>
            <Template code="CSAMCLCReportForm-AgeVerified" />
            &nbsp;
            <RequiredAsterisk />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{generateChildFormElement(childDefinitionObject.ageVerified)}</Box>
        </Box>
      </CSAMReportLayout>
      <BottomButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton secondary="true" roundCorners onClick={onClickClose}>
            <Template code="BottomBar-Cancel" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onSendReport} data-testid="CSAMCLCReport-SubmitButton">
          <Template code="BottomBar-CreateLink" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportChildForm.displayName = 'CSAMChildReportForm';

export default CSAMReportChildForm;
