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

import React from 'react';
import { Template } from '@twilio/flex-ui';

import { StyledCSAMReportDropdown, StyledCSAMReportDropdownList } from './styles';

type OwnProps = {
  handleChildCSAMType: () => void;
  handleCounsellorCSAMType: () => void;
  dropdown: boolean;
};

type Props = OwnProps;

const CSAMReportDropdown: React.FC<Props> = ({ handleChildCSAMType, handleCounsellorCSAMType, dropdown }) => {
  return (
    <StyledCSAMReportDropdown style={{ display: dropdown ? 'block' : 'none' }}>
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
