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

import React, { useState, useEffect } from 'react';
import { WorkersDataTable, ColumnDefinition } from '@twilio/flex-ui';
import Tooltip from '@material-ui/core/Tooltip';

import { getAseloFeatureFlags } from '../../hrmConfig';
import { sortStatus } from './teamsViewSorting';
import { FontOpenSans, TagMiddleDot } from '../../styles';
import { StatusActivityName } from './styles';

export const setUpStatusColumn = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="status"
      header="Status"
      sortingFn={sortStatus}
      style={{ width: 'calc(5rem)' }}
      content={item => <StatusCell item={item} />}
    />,
    { sortOrder: 0 },
  );
};

const StatusCell = ({ item }) => {
  const [time, setTime] = useState(item?.worker?.activityDuration ?? '');

  const isAvailable = item?.worker?.isAvailable ?? false;
  const activityName = item?.worker?.activityName ?? '';

  useEffect(() => {
    const isUnderOneHour = time.includes(':') || time.endsWith('s');
    const intervalTimeout = isUnderOneHour ? 1000 : 180000; // 1 second or 3 minutes

    const interval = setInterval(() => {
      setTime(item?.worker?.activityDuration);
    }, intervalTimeout);

    return () => clearInterval(interval);
  }, [time, item]);

  return (
    <>
      <div style={{ display: '-webkit-box' }}>
        <TagMiddleDot style={{ margin: '0px 5px 3px 1px' }} color={isAvailable ? '#14B053' : '#AEB2C1'} size="8" />
        {activityName.length > 11 ? (
          <Tooltip title={activityName} enterDelay={1000} enterTouchDelay={1000}>
            <StatusActivityName>{activityName}</StatusActivityName>
          </Tooltip>
        ) : (
          <StatusActivityName>{activityName}</StatusActivityName>
        )}
      </div>
      <FontOpenSans style={{ fontSize: '12px', marginLeft: '2ch' }}>{time}</FontOpenSans>
    </>
  );
};
