import React from 'react';
import { Template } from '@twilio/flex-ui';

import { StyledCSAMReportDropdown, StyledCSAMReportDropdownList, StyledCSAMReportHeader } from '../../styles/HrmStyles';

type OwnProps = {
  handleChildCSAMType: () => void;
  handleCounsellorCSAMType: () => void;
  dropdown: boolean;
};

type Props = OwnProps;

const CSAMReportDropdown: React.FC<Props> = ({ handleChildCSAMType, handleCounsellorCSAMType, dropdown }) => {
  return (
    <StyledCSAMReportDropdown style={{ display: dropdown ? 'block' : 'none' }}>
      <StyledCSAMReportHeader>
        <Template code="TabbedForms-CSAMReportButton" />
      </StyledCSAMReportHeader>
      <StyledCSAMReportDropdownList onClick={handleChildCSAMType}>
        <Template code="TabbedForms-ReportsChildLink" />
      </StyledCSAMReportDropdownList>
      <StyledCSAMReportDropdownList margin="0 -40px 10px -25px" onClick={handleCounsellorCSAMType}>
        <Template code="TabbedForms-ReportsCounselorReport" />
      </StyledCSAMReportDropdownList>
    </StyledCSAMReportDropdown>
  );
};

CSAMReportDropdown.displayName = 'CSAMReportDropdown'; 

export default CSAMReportDropdown;
