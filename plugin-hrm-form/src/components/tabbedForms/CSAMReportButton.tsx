/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreOutlined';
import AssignmentIcon from '@material-ui/icons/AssignmentOutlined';
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

  return (
    <>
      <div
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDropdown(false);
          }
        }}
      >
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
      </div>
    </>
  );
};

CSAMReportButton.displayName = 'CSAMReportButton';

export default CSAMReportButton;
