/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Row, CSAMReportButtonText, StyledCSAMReportButton } from '../../styles/HrmStyles';

type OwnProps = {
  handleClick: () => void;
};

type Props = OwnProps;

const CSAMReportButton: React.FC<Props> = ({ handleClick }) => {
  return (
    <Row>
      <StyledCSAMReportButton onClick={handleClick}>
        <OpenInNew fontSize="inherit" style={{ marginRight: 5 }} />
        <CSAMReportButtonText>
          <Template code="TabbedForms-CSAMReportButton" />
        </CSAMReportButtonText>
      </StyledCSAMReportButton>
    </Row>
  );
};

CSAMReportButton.displayName = 'CSAMReportButton';

export default CSAMReportButton;
