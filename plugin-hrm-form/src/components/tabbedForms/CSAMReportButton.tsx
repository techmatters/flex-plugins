/* eslint-disable react/prop-types */
import React from 'react';
import { ButtonBase } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Row, CSAMReportButtonText, Box } from '../../styles/HrmStyles';

type OwnProps = {
  handleClick: () => void;
};

type Props = OwnProps;

const CSAMReportButton: React.FC<Props> = ({ handleClick }) => {
  return (
    <Row>
      <ButtonBase onClick={handleClick}>
        <OpenInNew fontSize="inherit" style={{ marginRight: 5 }} />
        <CSAMReportButtonText>
          <Template code="TabbedForms-CSAMReportButton" />
        </CSAMReportButtonText>
      </ButtonBase>
    </Row>
  );
};

CSAMReportButton.displayName = 'CSAMReportButton';

export default CSAMReportButton;
