/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { BoldDescriptionText, CSAMReportContainer, CSAMReportLayout } from '../../styles/CSAMReport';
import { childDefinitionObject, childInitialValues, generateCSAMFormElement } from './CSAMReportFormDefinition';
import { RequiredAsterisk } from '../common/forms/formGenerators';
import { ChildCSAMReportForm } from '../../states/csam-report/types';
import { HTMLElementRef } from '../common/forms/types';

type Props = {
  counselor: string;
  onClickClose: () => void;
  onSendReport: () => void;
  update: (formValues: ChildCSAMReportForm) => void;
  formValues: ChildCSAMReportForm;
  methods: ReturnType<typeof useForm>;
  focusElementRef?: HTMLElementRef;
};

const CSAMReportChildForm: React.FC<Props> = ({
  counselor,
  onClickClose,
  onSendReport,
  update,
  formValues,
  methods,
  focusElementRef,
}) => {
  const generateChildFormElement = generateCSAMFormElement(childInitialValues, formValues, update, methods);
  return (
    <CSAMReportContainer style={{ padding: '5px' }} data-testid="CSAMReport-FormScreen">
      <CSAMReportLayout>
        <ActionHeader
          added={new Date()}
          codeTemplate="CSAMCLC-ActionHeaderAdded"
          titleTemplate="CSAMCLCReportForm-Header"
          onClickClose={onClickClose}
          addingCounsellor={counselor}
          space={`\xa0\xa0`}
        />

        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText style={{ color: '#192b33' }}>
            <Template code="CSAMCLCReportForm-ChildAge" />
            &nbsp;
            <RequiredAsterisk />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">
            {generateChildFormElement(childDefinitionObject.childAge, focusElementRef)}
          </Box>
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
};

CSAMReportChildForm.displayName = 'CSAMChildReportForm';

export default CSAMReportChildForm;
