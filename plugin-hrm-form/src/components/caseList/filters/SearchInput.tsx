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

/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prop-types */
import React, { Ref } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import { MultiSelectSearchInput } from '../../../styles';

type OwnProps = {
  label: string;
  searchTerm: string;
  innerRef: Ref<any>;
  onChangeSearch?: (event: any) => void;
  onBlurSearch?: (text: string) => void;
  clearSearchTerm: () => void;
  onShiftTab: (event: any) => void;
  onEnter?: (text: string) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const SearchInput: React.FC<Props> = ({
  label,
  searchTerm,
  innerRef,
  onChangeSearch,
  // eslint-disable-next-line no-empty-function
  onBlurSearch = () => {},
  clearSearchTerm,
  onShiftTab,
  // eslint-disable-next-line no-empty-function
  onEnter = () => {},
}) => {
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = event => {
    if (event.key === 'Enter') {
      onEnter(event.currentTarget.value);
    }
    onShiftTab(event);
  };

  const showClearButton = searchTerm.length > 1;

  return (
    <>
      <label htmlFor="search-input" style={{ display: 'block', fontSize: '14px', marginBottom: '10px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <SearchIcon style={{ position: 'absolute', top: 10, left: 8, fontSize: '20px', opacity: '40%' }} />
        <MultiSelectSearchInput
          id="search-input"
          ref={innerRef}
          value={searchTerm}
          type="string"
          onKeyDown={onKeyDown}
          autoComplete="off"
          onChange={onChangeSearch}
          onBlur={event => onBlurSearch(event.currentTarget.value)}
        />
        {showClearButton && (
          <ClearIcon
            onClick={clearSearchTerm}
            style={{ position: 'absolute', top: 10, right: 8, fontSize: '20px', cursor: 'pointer' }}
          />
        )}
      </div>
    </>
  );
};

SearchInput.displayName = 'SearchInput';

export default SearchInput;
