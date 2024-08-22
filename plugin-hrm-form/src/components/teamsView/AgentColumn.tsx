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

const MAX_NAME_LENGTH = 18;

export const setUpAgentColumn = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  const agentSortingFn = (a: any, b: any): number => {
    return a.worker.fullName.localeCompare(b.worker.fullName);
  };

  WorkersDataTable.Content.remove('worker');

  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="agent"
      header="Agent"
      sortingFn={agentSortingFn}
      style={{ width: '18%' }}
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
          <span key={labelAbbr} style={{ display: 'inline-flex' }}>
            <Tooltip title={labelName} enterDelay={500} enterTouchDelay={500}>
              <StyledChip chipType="label">{labelAbbr}</StyledChip>
            </Tooltip>
          </span>
        ))}
      </>
    );
  };

  const fullName = item?.worker?.fullName ?? '';

  return (
    <div style={{padding:'4px'}} tabIndex={0} aria-label={fullName}>
      {fullName.length > MAX_NAME_LENGTH ? (
        <Tooltip title={fullName} enterDelay={500} enterTouchDelay={500}>
          <AgentFullName>{`${fullName.substring(0, MAX_NAME_LENGTH)}…`}</AgentFullName>
        </Tooltip>
      ) : (
        <AgentFullName>{fullName}</AgentFullName>
      )}
      <Labels />
    </div>
  );
};
