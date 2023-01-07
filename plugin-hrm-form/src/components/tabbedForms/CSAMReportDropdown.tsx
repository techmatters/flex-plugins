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
      <StyledCSAMReportDropdownList
        onMouseDown={event => event.preventDefault}
        onClick={handleChildCSAMType}
        tabIndex={0}
      >
        <Template code="TabbedForms-ReportsChildLink" />
      </StyledCSAMReportDropdownList>
      <StyledCSAMReportDropdownList
        onMouseDown={event => event.preventDefault}
        onClick={handleCounsellorCSAMType}
        tabIndex={0}
      >
        <Template code="TabbedForms-ReportsCounselorReport" />
      </StyledCSAMReportDropdownList>
    </StyledCSAMReportDropdown>
  );
};

CSAMReportDropdown.displayName = 'CSAMReportDropdown';

export default CSAMReportDropdown;
