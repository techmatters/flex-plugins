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
import { WorkersDataTable, ColumnDefinition } from '@twilio/flex-ui';

import { StyledFormCheckbox } from '../forms/components/FormCheckbox/styles';

const SelectAllCheckbox: React.FC = () => {
  return (
    <StyledFormCheckbox
      type="checkbox"
      defaultChecked={false}
      disabled={false}
      required={false}
      onChange={e => {
        console.log('>>>>>>>>>> SELECT ALL CLICKED');
      }}
      onClick={e => {
        e.stopPropagation();
      }}
    />
  );
};

const SelectWorkerCheckbox: React.FC<{ item: { worker: { sid: string; fullName: string } } }> = ({
  children,
  ...props
}) => {
  const { worker } = props.item;

  return (
    <StyledFormCheckbox
      type="checkbox"
      defaultChecked={false}
      disabled={false}
      required={false}
      onChange={e => {
        console.log('>>>>>>>>>>', props, worker);
      }}
      onClick={e => {
        e.stopPropagation();
      }}
    />
  );
};

// eslint-disable-next-line import/no-unused-modules
export const setUpSelectAgentColumn = () => {
  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="select-worker"
      header={<SelectAllCheckbox />}
      // sortingFn={sortSkills}
      style={{ width: '30px', padding: '0px' }}
      content={(item: any) => <SelectWorkerCheckbox item={item} />}
    />,
    { sortOrder: 0 },
  );
};
