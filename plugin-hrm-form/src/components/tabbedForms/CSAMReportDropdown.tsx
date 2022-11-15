import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { StyledCSAMReportDropdown, StyledCSAMReportDropdownList, StyledCSAMReportHeader } from '../../styles/HrmStyles';
import { setCSAMType } from '../../states/csam-report/actions';

type OwnProps = {
  handleCSAMType: () => void;
  dropdown: boolean;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const CSAMReportDropdown: React.FC<Props> = ({ handleCSAMType, dropdown, setCSAMType }) => {
  return (
    <StyledCSAMReportDropdown style={{ display: dropdown ? 'block' : 'none' }}>
      <StyledCSAMReportHeader>
        <Template code="TabbedForms-CSAMReportButton" />
      </StyledCSAMReportHeader>
      <StyledCSAMReportDropdownList
        onClick={() => {
          setCSAMType('self-report');
          handleCSAMType();
        }}
      >
        <Template code="TabbedForms-ReportsChildLink" />
      </StyledCSAMReportDropdownList>
      <StyledCSAMReportDropdownList
        margin="0 -40px 10px -25px"
        onClick={() => {
          setCSAMType('counsellor-report');
          handleCSAMType();
        }}
      >
        <Template code="TabbedForms-ReportsCounselorReport" />
      </StyledCSAMReportDropdownList>
    </StyledCSAMReportDropdown>
  );
};

CSAMReportDropdown.displayName = 'CSAMReportDropdown';

const mapDispatchToProps = {
  setCSAMType,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(CSAMReportDropdown);
export default connected;
