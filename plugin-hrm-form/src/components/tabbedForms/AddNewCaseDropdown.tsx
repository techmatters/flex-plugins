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

import { StyledAddNewCaseDropdown, StyledAddNewCaseDropdownList } from '../../styles/HrmStyles';

type OwnProps = {
  handleNewCaseType: () => void;
  handleExistingCaseType: () => void;
  dropdown: boolean;
};

type Props = OwnProps;

const AddNewCaseDropdown: React.FC<Props> = ({ handleNewCaseType, handleExistingCaseType, dropdown }) => {
  return (
    <StyledAddNewCaseDropdown style={{ display: dropdown ? 'block' : 'none' }}>
      <StyledAddNewCaseDropdownList
        onMouseDown={event => event.preventDefault}
        onClick={handleNewCaseType}
        tabIndex={0}
        data-testid="TabbedForms-AddNewCase-Button"
      >
        <Template code="TabbedForms-NewCase" />
      </StyledAddNewCaseDropdownList>
      <StyledAddNewCaseDropdownList
        onMouseDown={event => event.preventDefault}
        onClick={handleExistingCaseType}
        tabIndex={0}
      >
        <Template code="TabbedForms-ExistingCase" />
      </StyledAddNewCaseDropdownList>
    </StyledAddNewCaseDropdown>
  );
};

AddNewCaseDropdown.displayName = 'AddNewCaseDropdown';

export default AddNewCaseDropdown;
