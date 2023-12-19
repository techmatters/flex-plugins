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
import React, { useRef, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreOutlined';
import AssignmentIcon from '@material-ui/icons/AssignmentOutlined';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Row } from '../../styles/HrmStyles';
import { CSAMReportButtonText } from './styles';
import { StyledCSAMReportButton } from '../../styles/buttons';
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
                <Template code="TabbedForms-CSAMReportButton" />
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
