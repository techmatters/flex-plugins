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
import {
  FormLabel,
  FormGroup,
  FormControlLabel,
  FormControl,
  FormHelperText,
  Switch,
  Modal,
  Tab,
  IconButton,
} from '@material-ui/core';

import { getAseloFeatureFlags } from '../../hrmConfig';
import TabPressWrapper from '../TabPressWrapper';
import { Box } from '../../styles';
import { CloseButton, DialogContainer, DialogStyled } from '../callTypeButtons/styles';
import { switchboardingQueue } from '../../services/SwitchboardingService';

// eslint-disable-next-line import/no-unused-modules
export const setUpSwitchboarding = () => {
  // if (!getAseloFeatureFlags().enable_switchboarding) return;

  QueuesStats.AggregatedQueuesDataTiles.Content.add(<SwitchboardingTile key="switchboarding" />, {
    sortOrder: -1,
  });
};

const SwitchboardingTile = () => {
  const [isSwitchboarding, setIsSwitchboarding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSwitchboarding = async queue => {
    console.log('>>>>> handleSwitchboarding input', { queue });
    const result = await switchboardingQueue(queue);
    console.log('>>>>> handleSwitchboarding result', result);
    setIsSwitchboarding(!isSwitchboarding);
    setSelectedQueue(queue); // Update state after the operation if needed
  };

  const renderSwitch = () => (
    <FormControl component="fieldset">
      <FormGroup>
        <FormControlLabel
          labelPlacement="start"
          control={<Switch checked={isSwitchboarding} color="primary" onChange={handleOpenModal} />}
          label="Switchboarding"
        />
      </FormGroup>
    </FormControl>
  );

  const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;

  const filteredQueues = queues
    ? Object.values(queues).filter(
        (queue: any) => queue.friendly_name !== 'Survey' && queue.friendly_name !== 'Switchboard Queue',
      )
    : [];

  return (
    <>
      <Box>{renderSwitch()}</Box>
      {isModalOpen && (
        <DialogStyled open={isModalOpen} onClose={handleCloseModal}>
          <TabPressWrapper>
            <DialogContainer>
              <Box marginLeft="auto">
                <Template code="CloseButton" />
                <CloseButton tabIndex={3} aria-label="CloseButton" onClick={handleCloseModal} />
              </Box>

              <div>
                <h1>Queues</h1>
                <form>
                  {filteredQueues &&
                    filteredQueues.map(queue => (
                      <div key={queue.key}>
                        <input
                          type="radio"
                          id={queue.key}
                          name="queue"
                          value={queue.key}
                          checked={selectedQueue === queue.key}
                          onChange={e => setSelectedQueue(e.target.value)}
                        />
                        <label htmlFor={queue.key}>{queue.friendly_name}</label>
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() => handleSwitchboarding('WQb4a3a7e8808c61d11d344e5b28fa53ef')}
                    // disabled={!selectedQueue}
                  >
                    Assign Switchboard
                  </button>
                </form>
              </div>
            </DialogContainer>
          </TabPressWrapper>
        </DialogStyled>
      )}
    </>
  );
};
