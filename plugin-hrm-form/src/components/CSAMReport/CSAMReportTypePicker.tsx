/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';

import ActionHeader from '../case/ActionHeader';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { BoldDescriptionText, CSAMReportContainer, CSAMReportLayout } from '../../styles/CSAMReport';
import { getInputType } from '../common/forms/formGenerators';
import { CSAMReportType } from '../../states/csam-report/types';
import { externalReportDefinition } from './CSAMReportFormDefinition';

type Props = {
  renderContactDetails?: boolean;
  counselor: string;
  onClickClose: () => void;
  onSubmit: () => void;
  isEmpty?: boolean;
  methods: ReturnType<typeof useForm>;
  reportType: CSAMReportType;
  pickReportType: (reportTypeFormValue: string) => void;
};

const CSAMReportTypePicker: React.FC<Props> = ({
  counselor,
  onClickClose,
  onSubmit,
  methods,
  reportType,
  pickReportType,
}) => {
  const { getValues } = methods;
  const formElement = React.useMemo(() => {
    return getInputType([], () => pickReportType(getValues(['reportType']).reportType))(externalReportDefinition[0])(
      reportType,
    );
  }, [getValues, pickReportType, reportType]);

  return (
    <CSAMReportContainer data-testid="CSAMReport-TypePicker">
      <CSAMReportLayout>
        <ActionHeader
          added={new Date()}
          codeTemplate="CSAMCLC-ActionHeaderAdded"
          titleTemplate="Contact-ExternalReport"
          onClickClose={onClickClose}
          addingCounsellor={counselor}
          space={`\xa0\xa0`}
        />

        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText style={{ color: '#192b33' }}>
            <Template code="Select CSAM report type" />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{formElement}</Box>
        </Box>
      </CSAMReportLayout>

      <BottomButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton secondary roundCorners onClick={onClickClose}>
            <Template code="BottomBar-Cancel" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onSubmit} data-testid="CSAMReport-PickerSubmitButton">
          <Template code="BottomBar-Next" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportTypePicker.displayName = 'CSAMReportTypePicker';

export default CSAMReportTypePicker;
