/* eslint-disable react/jsx-max-depth */
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

import { AutoCompleteDropdown, AutoCompleteDropdownRow } from '../styles';
import { sanitizeInputForSuggestions, TaxonomyLevelNameCompletion } from '../../../states/resources/search';

type OwnProps = {
  generalSearchTermBoxText: string;
  setGeneralSearchTermBoxText: (event: string) => void;
  suggestSearch: TaxonomyLevelNameCompletion;
};

type Props = OwnProps;

const SearchAutoComplete: React.FC<Props> = ({
  generalSearchTermBoxText,
  suggestSearch,
  setGeneralSearchTermBoxText,
}) => {
  const searchTerm = sanitizeInputForSuggestions(generalSearchTermBoxText);
  const searchTermLength = searchTerm.length >= 3;

  const onSearch = (searchTerm: string) => {
    setGeneralSearchTermBoxText(`"${searchTerm}"`);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <AutoCompleteDropdown>
        {suggestSearch.taxonomyLevelNameCompletion
          .filter(item => {
            const text = item.text.toLocaleLowerCase();
            return searchTermLength && text.includes(searchTerm) && text !== searchTerm;
          })
          .slice(0, 9)
          .map((item, index) => {
            const regex = new RegExp(searchTerm, 'gi');
            const modifiedItem = item.text.replace(regex, match => `<span style="font-weight: bold">${match}</span>`);
            return (
              <AutoCompleteDropdownRow
                onClick={() => onSearch(item.text)}
                key={index}
                dangerouslySetInnerHTML={{ __html: modifiedItem }}
              />
            );
          })}
      </AutoCompleteDropdown>
    </div>
  );
};
export default SearchAutoComplete;
