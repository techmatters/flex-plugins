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

import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';
import FolderIcon from '@material-ui/icons/CreateNewFolderOutlined';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import { getAseloConfigFlags } from '../../hrmConfig';
import { SecondaryButton } from '../../styles/buttons';
import { StyledAddNewCaseDropdown, StyledAddNewCaseDropdownList } from './styles';

type OwnProps = {
  handleNewCaseType: () => void;
  handleExistingCaseType: () => void;
  position?: string;
};

type Props = OwnProps;

const AddCaseButton: React.FC<Props> = ({ handleNewCaseType, handleExistingCaseType, position }) => {
  const { hideAddToNewCaseButton } = getAseloConfigFlags();
  const [dropdown, setDropdown] = useState(false);

  const [enabled, setEnabled] = useState(true);

  const newOptionHandler = (handler: () => void) => () => {
    setDropdown(false);
    // TODO: Button should be disabled based on case update pending states in redux, this is a temporary fix
    setEnabled(false);
    handler();
  };

  const handleDropdown = () => {
    setDropdown(previous => !previous);
  };

  return (
    <SecondaryButton
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setDropdown(false);
        }
      }}
      type="button"
      roundCorners
      onClick={handleDropdown}
      data-fs-id="Contact-SaveAndAddToCase-Button"
      data-testid="BottomBar-SaveAndAddToCase-Button"
      disabled={!enabled}
      style={{ padding: '4px 8px' }}
    >
      <StyledAddNewCaseDropdown position={position} dropdown={dropdown}>
        {hideAddToNewCaseButton ? null : (
          <StyledAddNewCaseDropdownList
            onMouseDown={event => event.preventDefault}
            onClick={newOptionHandler(handleNewCaseType)}
            tabIndex={0}
            data-testid="TabbedForms-AddNewCase-Button"
            data-fs-id="TabbedForms-AddToNewCase-Button"
          >
            <Template code="TabbedForms-NewCase" />
          </StyledAddNewCaseDropdownList>
        )}
        <StyledAddNewCaseDropdownList
          onMouseDown={event => event.preventDefault}
          onClick={newOptionHandler(handleExistingCaseType)}
          tabIndex={0}
          data-fs-id="TabbedForms-AddToExistingCase-Button"
        >
          <Template code="TabbedForms-ExistingCase" />
        </StyledAddNewCaseDropdownList>
      </StyledAddNewCaseDropdown>
      <FolderIcon style={{ fontSize: '16px', marginRight: '10px', width: '24px', height: '24px' }} />
      <Template code="BottomBar-AddContactToNewCase" />
      {dropdown && (
        <KeyboardArrowUpIcon style={{ fontSize: '20px', marginLeft: '10px', width: '24px', height: '24px' }} />
      )}
      {!dropdown && (
        <KeyboardArrowDownIcon style={{ fontSize: '20px', marginLeft: '10px', width: '24px', height: '24px' }} />
      )}
    </SecondaryButton>
  );
};

AddCaseButton.displayName = 'AddCaseButton';

export default AddCaseButton;
