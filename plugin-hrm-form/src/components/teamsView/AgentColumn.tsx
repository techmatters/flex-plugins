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
import Tooltip from '@material-ui/core/Tooltip';

import { getAseloFeatureFlags } from '../../hrmConfig';
import { AgentFullName, StyledChip } from './styles';

export const setUpAgentColumn = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  const agentSortingFn = (a: any, b: any): number => {
    return a > b ? 1 : -1;
  };

  WorkersDataTable.Content.remove('worker');

  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="agent"
      header="Agent"
      sortingFn={agentSortingFn}
      style={{ width: 'calc(11rem)' }}
      content={item => <AgentCell item={item} />}
    />,
    { sortOrder: 0 },
  );
};

const AgentCell = ({ item }) => {
  const Labels = () => {
    const labels: string[] | undefined = item?.worker?.attributes?.labels;
    if (labels === undefined) return null;

    // key and value are strings
    const labelsObj = labels.reduce((acc: { [key: string]: string }, label: string) => {
      const [key, value] = label.split(':');
      acc[key] = value;
      return acc;
    }, {});

    return (
      <>
        {Object.entries(labelsObj).map(([labelAbbr, labelName]) => (
          <p key={labelAbbr} style={{ display: 'inline-flex' }}>
            <Tooltip title={labelName} enterDelay={500} enterTouchDelay={500}>
              <StyledChip chipType="label">{labelAbbr}</StyledChip>
            </Tooltip>
          </p>
        ))}
      </>
    );
  };

  const fullName = item?.worker?.fullName ?? '';

  return (
    <>
      <Tooltip title={fullName} enterDelay={1000} enterTouchDelay={1000}>
        <AgentFullName>{fullName}</AgentFullName>
      </Tooltip>
      <Labels />
    </>
  );
};
