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
import { CloseButton, NonDataCallTypeDialogContainer, CloseTaskDialog } from '../callTypeButtons/styles';
import { switchboardQueue } from '../../services/SwitchboardingService';
import SwitchboardIcon from '../common/icons/SwitchboardIcon';

// eslint-disable-next-line import/no-unused-modules
export const setUpSwitchboard = () => {
  // if (!getAseloFeatureFlags().enable_switchboarding) return;

  QueuesStats.AggregatedQueuesDataTiles.Content.add(<SwitchboardTile key="switchboard" />, {
    sortOrder: -1,
  });
};

const SwitchboardTile = () => {
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
    const result = await switchboardQueue(queue);
    console.log('>>>>> handleSwitchboarding result', result);
    setIsSwitchboarding(!isSwitchboarding);
    setSelectedQueue(queue); // Update state after the operation if needed
  };

  const renderSwitchboard = () => (
    <Box style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <SwitchboardIcon width="24px" height="24px"/>
          <span style={{ fontWeight: 'bold', fontSize: '18px', marginLeft: '10px' }}>
            Switchboarding: {isSwitchboarding ? 'On' : 'Off'}
          </span>
        </Box>
        <Switch 
          checked={isSwitchboarding} 
          onChange={handleOpenModal} 
          color="primary"
        />
      </Box>
      <Box style={{ marginTop: '15px' }}>
        <p style={{ fontSize: '16px' }}>No queues are currently being switchboarded</p>
      </Box>
    </Box>
  );

  const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;

  const filteredQueues = queues
    ? Object.values(queues).filter(
        (queue: any) => queue.friendly_name !== 'Survey' && queue.friendly_name !== 'Switchboard Queue',
      )
    : [];

  return (
    <>
      {renderSwitchboard()}
      {isModalOpen && (
        <CloseTaskDialog open={isModalOpen} onClose={handleCloseModal}>
          <TabPressWrapper>
            <NonDataCallTypeDialogContainer>
              <Box marginLeft="auto">
                <Template code="CloseButton" />
                <CloseButton tabIndex={3} aria-label="CloseButton" onClick={handleCloseModal} />
              </Box>

              <div>
                <h1>Queues</h1>
                <form>
                  {filteredQueues &&
                    filteredQueues.map(queue => {
                      console.log('>>> Queue:', queue);
                      return (
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
                      );
                    })}
                  <button
                    type="button"
                    onClick={() => handleSwitchboarding('WQ55df346e2986acff362141c83f5cdf29')}
                    // disabled={!selectedQueue}
                  >
                    Assign Switchboard
                  </button>
                </form>
              </div>
            </NonDataCallTypeDialogContainer>
          </TabPressWrapper>
        </CloseTaskDialog>
      )}
    </>
  );
};