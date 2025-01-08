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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSwitchboarding(!isSwitchboarding);
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
    </>
  );
};
