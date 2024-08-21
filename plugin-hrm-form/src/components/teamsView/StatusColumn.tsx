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
import { sortStatusColumn } from './teamsViewSorting';
import { FontOpenSans, TagMiddleDot } from '../../styles';
import { StatusActivityName } from './styles';

const MAX_STATUS_LENGTH = 12;

export const setUpStatusColumn = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="status"
      header="Status"
      sortingFn={sortStatusColumn}
      style={{ width: 'calc(7rem)' }}
      content={item => <StatusCell item={item} />}
    />,
    { sortOrder: 0 },
  );
};

const StatusCell = ({ item }) => {
  const isAvailable = item?.worker?.isAvailable ?? false;
  const activityName = item?.worker?.activityName ?? '';
  const [time, setTime] = useState(item?.worker?.activityDuration ?? '');

  useEffect(() => {
    const isUnderOneHour = time.includes(':') || time.endsWith('s');
    const intervalTimeout = isUnderOneHour ? 1000 : 60000; // 1 second or 1 minute

    // initial render at 0 seconds
    setTime(item?.worker?.activityDuration);

    // update when time or activity changes
    const interval = setInterval(() => {
      setTime(item?.worker?.activityDuration);
    }, intervalTimeout);

    return () => clearInterval(interval);
  }, [time, item, activityName]);

  return (
    <div style={{ color: '#121C2D', lineHeight: 'normal' }}>
      <div style={{ display: '-webkit-box' }}>
        <TagMiddleDot style={{ margin: '0px 5px 2px 1px' }} color={isAvailable ? '#14B053' : '#AEB2C1'} size="8" />
        {activityName.length > 12 ? (
          <Tooltip title={activityName} enterDelay={1000} enterTouchDelay={1000}>
            <StatusActivityName>{`${activityName.substring(0, MAX_STATUS_LENGTH)}…`}</StatusActivityName>
          </Tooltip>
        ) : (
          <StatusActivityName>{activityName}</StatusActivityName>
        )}
      </div>
      <FontOpenSans style={{ fontSize: '12px', marginLeft: '2ch' }}>{time}</FontOpenSans>
    </div>
  );
};
