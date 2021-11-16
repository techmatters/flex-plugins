/* eslint-disable react/prop-types */
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, Row, StyledNextStepButton } from '../../styles/HrmStyles';
import { CSAMReportContainer, CSAMReportLayout, BoldDescriptionText, RegularText } from '../../styles/CSAMReportForm';
import { FormItemDefinition } from '../common/forms/types';
import { getInputType, getInitialValue } from '../common/forms/formGenerators';

type OwnProps = {
  onClickClose: () => void;
};

type Props = OwnProps;

const CSAMReportForm: React.FC<Props> = ({ onClickClose }) => {
  const methods = useForm();

  const onUpdateInput = () => console.log(methods.getValues());
  const handleSubmitReport = async () => console.log(await methods.trigger());
  const generateInput = (e: FormItemDefinition) => getInputType([], onUpdateInput)(e)(getInitialValue(e));

  const webAddressInput = generateInput({
    name: 'webAddress',
    label: 'Web address',
    type: 'input',
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: 1000,
  });

  const descriptionTextArea = generateInput({
    name: 'description',
    label: 'Description (500 characters)',
    type: 'textarea',
    maxLength: 500,
  });

  const anonCheckbox = generateInput({
    name: 'anonymous',
    label: 'File anonymously',
    type: 'checkbox',
    initialChecked: true,
  });

  const firstNameInput = generateInput({
    name: 'firstName',
    label: "Reporter's First Name",
    type: 'input',
    maxLength: 50,
  });

  const lastNameInput = generateInput({
    name: 'lastName',
    label: "Reporter's Last Name",
    type: 'input',
    maxLength: 50,
  });

  const emailInput = generateInput({
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: 100,
  });

  const anonymous = methods.watch('anonymous');

  return (
    <FormProvider {...methods}>
      <CSAMReportContainer>
        <CSAMReportLayout>
          <ActionHeader titleTemplate="CSAMReportForm-Header" onClickClose={onClickClose} counselor="someone" />

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
            {webAddressInput}
            {descriptionTextArea}
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
          <Box padding="15px 15px 15px 20px">{anonCheckbox}</Box>

          {/** Conditional part of the form only shown if contact is not anon */}
          {anonymous === false && (
            <Box marginTop="20px" marginBottom="5px">
              <RegularText>
                <Template code="CSAMReportForm-ContactDetailsInfo" />
              </RegularText>
              <Box padding="15px 15px 15px 20px">
                {firstNameInput}
                {lastNameInput}
                {emailInput}
              </Box>
            </Box>
          )}
        </CSAMReportLayout>

        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton data-testid="Case-AddNoteScreen-SaveNote" roundCorners onClick={handleSubmitReport}>
            <Template code="BottomBar-SendReport" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CSAMReportContainer>
    </FormProvider>
  );
};

CSAMReportForm.displayName = 'CSAMReportForm';

export default CSAMReportForm;
