/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreOutlined';
import AssignmentIcon from '@material-ui/icons/AssignmentOutlined';
import StorageIcon from '@material-ui/icons/StorageOutlined';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Row, CSAMReportButtonText, StyledCSAMReportButton } from '../../styles/HrmStyles';
import CSAMReportDropdown from './CSAMReportDropdown';

type OwnProps = {
  handleChildCSAMType: () => void;
  handleCounsellorCSAMType: () => void;
  csamReportEnabled: boolean;
  csamClcReportEnabled: boolean;
};

type Props = OwnProps;

const CSAMReportButton: React.FC<Props> = ({
  handleChildCSAMType,
  handleCounsellorCSAMType,
  csamReportEnabled,
  csamClcReportEnabled,
}) => {
  const [dropdown, setDropdown] = useState(false);
  const buttonRef = useRef(null);

  const handleDropdown = () => {
    setDropdown(previous => !previous);
  };

  /* This useEffect handles closing the dropdown when a user clicks outside the dropdown */
  useEffect(() => {
    const closeDropdown = e => {
      if (e.path[0] !== buttonRef.current) {
        setDropdown(false);
      }
    };
    document.body.addEventListener('click', closeDropdown);
    return () => document.body.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <>
      <Row>
        {csamReportEnabled && csamClcReportEnabled && (
          <StyledCSAMReportButton ref={buttonRef} style={{ marginRight: 10 }} onClick={handleDropdown}>
            <AssignmentIcon fontSize="inherit" style={{ marginRight: 5 }} />
            <CSAMReportButtonText>
              <Template code="TabbedForms-ExternalReports" />
            </CSAMReportButtonText>
            <ExpandMoreIcon fontSize="inherit" style={{ marginLeft: 10 }} />
          </StyledCSAMReportButton>
        )}
        {csamReportEnabled && !csamClcReportEnabled && (
          <StyledCSAMReportButton onClick={handleCounsellorCSAMType}>
            <OpenInNew fontSize="inherit" style={{ marginRight: 5 }} />
            <CSAMReportButtonText>
              <Template code="TabbedForms-CSAMFileReportButton" />
            </CSAMReportButtonText>
          </StyledCSAMReportButton>
        )}
      </Row>
      <CSAMReportDropdown
        dropdown={dropdown}
        handleChildCSAMType={handleChildCSAMType}
        handleCounsellorCSAMType={handleCounsellorCSAMType}
      />
    </>
  );
};

CSAMReportButton.displayName = 'CSAMReportButton';

export default CSAMReportButton;
