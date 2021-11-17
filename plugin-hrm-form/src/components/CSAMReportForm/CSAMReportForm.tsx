/* eslint-disable react/prop-types */
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { CSAMReportContainer, CSAMReportLayout, BoldDescriptionText, RegularText } from '../../styles/CSAMReportForm';
import { FormItemDefinition } from '../common/forms/types';
import { getInputType } from '../common/forms/formGenerators';
import { definitionObject, keys, initialValues } from './CSAMReportFormDefinition';
import * as t from '../../states/csam-report/actions';
import type { CustomITask } from '../../types/types';
import { getConfig } from '../../HrmFormPlugin';
import { RootState, csamReportBase, namespace } from '../../states';
import { reportToIWF } from '../../services/ServerlessService';

type OwnProps = {
  onClickClose: () => void;
  taskSid: CustomITask['taskSid'];
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  init: state[namespace][csamReportBase].tasks[ownProps.taskSid],
});

const mapDispatchToProps = {
  updateFormAction: t.updateFormAction,
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CSAMReportForm: React.FC<Props> = ({ onClickClose, updateFormAction, taskSid, init }) => {
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();

  const onValid = async form => {
    const report = await reportToIWF(form);
    console.log('>>>>>, report result: ', report);
  };

  const onInvalid = () => {
    window.alert(getConfig().strings['Error-Form']);
  };

  const formElements = React.useMemo(() => {
    const onUpdateInput = () => {
      const values = methods.getValues(Object.values(keys));
      updateFormAction(values, taskSid);
    };

    const generateInput = (e: FormItemDefinition) => {
      const initialValue = initialForm[e.name] === undefined ? initialValues[e.name] : initialForm[e.name];

      return getInputType([], onUpdateInput)(e)(initialValue);
    };

    return Object.entries(definitionObject).reduce<{ [k in keyof typeof definitionObject]: JSX.Element }>(
      (accum, [k, e]) => ({
        ...accum,
        [k]: generateInput(e),
      }),
      null,
    );
  }, [initialForm, methods, taskSid, updateFormAction]);

  const anonymousWatch = methods.watch('anonymous');
  const renderContactDetails =
    anonymousWatch === false || (anonymousWatch === undefined && initialForm.anonymous === false);

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
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton
            data-testid="Case-AddNoteScreen-SaveNote"
            roundCorners
            onClick={methods.handleSubmit(onValid, onInvalid)}
          >
            <Template code="BottomBar-SendReport" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CSAMReportContainer>
    </FormProvider>
  );
};

CSAMReportForm.displayName = 'CSAMReportForm';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CSAMReportForm);

export default connected;
