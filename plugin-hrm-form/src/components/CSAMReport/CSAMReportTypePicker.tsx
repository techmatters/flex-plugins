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
import { BottomButtonBar, Box, HeaderCloseButton, HiddenText, Row, PrimaryButton } from '../../styles';
import { BoldDescriptionText, CSAMReportContainer, CSAMReportLayout } from './styles';
import { addMargin, getInputType } from '../common/forms/formGenerators';
import { CSAMReportType } from '../../states/csam-report/types';
import { externalReportDefinition } from './CSAMReportFormDefinition';
import { CaseActionTitle } from '../case/styles';
import useFocus from '../../utils/useFocus';

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
    return addMargin(5)(
      getInputType([], () => pickReportType(getValues(['reportType']).reportType))(externalReportDefinition[0])(
        reportType,
      ),
    );
  }, [getValues, pickReportType, reportType]);

  const focusElementRef = useFocus();
  return (
    <CSAMReportContainer data-testid="CSAMReport-TypePicker">
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
        <ActionHeader added={new Date()} codeTemplate="CSAMCLC-ActionHeaderAdded" addingCounsellor={counselor} />

        <Box marginTop="20px" marginBottom="5px">
          <BoldDescriptionText style={{ color: '#192b33' }}>
            <Template code="CSAMReportForm-SelectReportType" />
          </BoldDescriptionText>
          <Box padding="15px 15px 15px 20px">{formElement}</Box>
        </Box>
      </CSAMReportLayout>

      <BottomButtonBar>
        <Box marginRight="15px">
          <PrimaryButton secondary="true" roundCorners onClick={onClickClose}>
            <Template code="BottomBar-Cancel" />
          </PrimaryButton>
        </Box>
        <PrimaryButton roundCorners onClick={onSubmit} data-testid="CSAMReport-PickerSubmitButton">
          <Template code="BottomBar-Next" />
        </PrimaryButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportTypePicker.displayName = 'CSAMReportTypePicker';

export default CSAMReportTypePicker;
