/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prop-types */
import React, { Ref } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import { MultiSelectSearchInput } from '../../../styles/caseList/filters';

type OwnProps = {
  label: string;
  searchTerm: string;
  innerRef: Ref<any>;
  onChangeSearch: (event: any) => void;
  clearSearchTerm: () => void;
  onShiftTab: (event: any) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const SearchInput: React.FC<Props> = ({ label, searchTerm, innerRef, onChangeSearch, clearSearchTerm, onShiftTab }) => {
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
          innerRef={innerRef}
          value={searchTerm}
          onChange={onChangeSearch}
          type="string"
          onKeyDown={onShiftTab}
          autoComplete="off"
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
