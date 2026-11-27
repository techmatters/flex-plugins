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
import { Grid } from '@material-ui/core';

import { FiltersCheckbox, FormLabel } from '../../../styles';
import { ResourcesSearchFormFilterHeader, ResourcesSearchFormSettingBox } from '../styles';
import { FilterOption } from '../../../states/resources/types';

type CheckboxMultiSelectOptionsProps = {
  options: FilterOption[];
  selectedValues: string[];
  // Receives undefined when nothing is selected, so the filter is dropped from the search
  onChange: (selectedValues: string[] | undefined) => void;
};

/**
 * Grid with a checkbox for every option it is given.
 * Selections are computed against all selectedValues, so options that are not shown stay selected.
 */
export const CheckboxMultiSelectOptions: React.FC<CheckboxMultiSelectOptionsProps> = ({
  options,
  selectedValues,
  onChange,
}) => (
  <Grid container>
    {options.map(({ value, label }) => (
      <Grid key={value} xs={4} item>
        <FormLabel htmlFor={value} style={{ flexDirection: 'row' }}>
          <FiltersCheckbox
            id={value}
            name={value}
            type="checkbox"
            checked={selectedValues.includes(value)}
            onChange={({ target: { checked } }) => {
              const newSelections = checked
                ? [...selectedValues, value]
                : selectedValues.filter(option => option !== value);
              onChange(newSelections.length ? newSelections : undefined);
            }}
          />
          &nbsp;&nbsp;
          <Template code={label ?? value} />
        </FormLabel>
      </Grid>
    ))}
  </Grid>
);

type CheckboxMultiSelectFilterProps = CheckboxMultiSelectOptionsProps & { headerCode: string };

const CheckboxMultiSelectFilter: React.FC<CheckboxMultiSelectFilterProps> = ({ headerCode, ...optionsProps }) => (
  <ResourcesSearchFormSettingBox>
    <ResourcesSearchFormFilterHeader>
      <Template code={headerCode} />
    </ResourcesSearchFormFilterHeader>
    <CheckboxMultiSelectOptions {...optionsProps} />
  </ResourcesSearchFormSettingBox>
);

export default CheckboxMultiSelectFilter;
