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
import { QueuesStats, Template, Manager } from '@twilio/flex-ui';
import { FormLabel, FormGroup, FormControlLabel, FormControl, FormHelperText, Switch } from '@material-ui/core';

import { getAseloFeatureFlags } from '../../hrmConfig';
import { Box } from '../../styles';

// eslint-disable-next-line import/no-unused-modules
export const setUpSwitchboarding = () => {
  // if (!getAseloFeatureFlags().enable_switchboarding) return;

  QueuesStats.AggregatedQueuesDataTiles.Content.add(<SwitchboardingTile key="switchboarding" />, {
    sortOrder: -1,
  });
};

const SwitchboardingTile = () => {
  const [isSwitchboarding, setIsSwitchboarding] = useState(false);
  const [openQueuesModal, setOpenQueuesModal] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setIsSwitchboarding(!isSwitchboarding);
    setOpenQueuesModal(!openQueuesModal);
  };

  const renderSwitch = () => (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend">Switchboardingfl</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={isSwitchboarding} color="primary" onChange={handleChange} />}
          label="Switchboardingl"
        />
      </FormGroup>
    </FormControl>
  );

  const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;
  const queuesConfig = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesConfig;
  console.log('>>> queues', queues, queuesConfig);

  return (
    <>
      <Box>{renderSwitch()}</Box>
      {openQueuesModal && (
        <dialog>
          <h1>Queues</h1>
          <ul>
            {Array.isArray(queues) &&
              queues.map((queue: any) => (
                <li key={queue.sid}>
                  <span>{queue.friendlyName}</span>
                  <span>{queue.sid}</span>
                  <span>{queuesConfig[queue.sid]?.config?.targetWorkersExpression}</span>
                </li>
              ))}
          </ul>
          <button type="button" onClick={() => setOpenQueuesModal(false)}>
            Close
          </button>
        </dialog>
      )}
    </>
  );
};
