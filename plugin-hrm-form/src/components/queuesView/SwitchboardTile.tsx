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
import { QueuesStats, Manager } from '@twilio/flex-ui';
import { Switch, Button } from '@material-ui/core';
import { useSelector } from 'react-redux';

import { getAseloFeatureFlags, getHrmConfig } from '../../hrmConfig';
import TabPressWrapper from '../TabPressWrapper';
import { Bold, Box, StyledNextStepButton } from '../../styles';
import { CloseButton, NonDataCallTypeDialogContainer, CloseTaskDialog } from '../callTypeButtons/styles';
import { switchboardQueue } from '../../services/SwitchboardingService';
import SwitchboardIcon from '../common/icons/SwitchboardIcon';
import { RootState } from '../../states';
import { namespace, configurationBase } from '../../states/storeNamespaces';

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
  const [switchboardingStartTime, setSwitchboardingStartTime] = useState<string | null>(null);

  // Use a ref to track the selected queue to avoid state timing issues
  const selectedQueueRef = React.useRef<string | null>(null);

  const { workerSid } = getHrmConfig();

  const counselorsHash = useSelector((state: RootState) => state[namespace][configurationBase].counselors.hash);

  // Update ref when state changes
  useEffect(() => {
    selectedQueueRef.current = selectedQueue;
    console.log('>>> Updated queue ref:', selectedQueueRef.current);
  }, [selectedQueue]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset selection when opening modal
    setSelectedQueue(null);
    selectedQueueRef.current = null;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSwitchboarding = async (queue: string) => {
    console.log('>>>>> handleSwitchboarding input', { queue });
    if (!queue) {
      console.error('>>>> No queue selected for switchboarding');
      return;
    }

    try {
      const result = await switchboardQueue(queue);
      console.log('>>>>> handleSwitchboarding result', result);
      const willBeActive = !isSwitchboarding;
      setIsSwitchboarding(willBeActive);

      // Store the current date/time when activating switchboarding
      if (willBeActive) {
        const currentTime = new Date().toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        setSwitchboardingStartTime(currentTime);
      } else {
        setSwitchboardingStartTime(null);
      }

      setIsModalOpen(false); // Close the modal after selection
      setSelectedQueue(queue); // Update state after the operation if needed
    } catch (error) {
      console.error('Error in switchboarding:', error);
    }
  };
  const renderSwitchboard = () => (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        border: '2px solid #e1e3ea',
        borderRadius: '4px',
        backgroundColor: isSwitchboarding ? '#FFF7DE' : 'transparent',
      }}
      data-testid="switchboard-tile"
    >
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <SwitchboardIcon width="24px" height="24px" />
          <span style={{ fontWeight: 'bold', fontSize: '14px', marginLeft: '10px' }}>
            Switchboarding: {isSwitchboarding ? 'In Progress' : 'Off'}
          </span>
        </Box>
        <Switch checked={isSwitchboarding} onChange={handleOpenModal} color="primary" />
      </Box>
      <Box style={{ marginTop: '15px' }}>
        {isSwitchboarding && selectedQueue ? (
          <div>
            <span>
              <Bold>{filteredQueues.find((q: any) => q.key === selectedQueue)?.friendly_name || selectedQueue}</Bold>{' '}
              calls are being switchboarded by supervisor{' '}
              <Bold>
                {counselorsHash && workerSid
                  ? counselorsHash[workerSid] || Manager.getInstance().user.identity
                  : Manager.getInstance().user.identity}
              </Bold>{' '}
              since {switchboardingStartTime}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: '16px' }}>No queues are currently being switchboarded</p>
        )}
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
        <CloseTaskDialog open={isModalOpen} onClose={handleCloseModal} width={500}>
          <TabPressWrapper>
            <NonDataCallTypeDialogContainer style={{ position: 'relative', maxWidth: '500px', padding: '20px' }}>
              <Box style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <CloseButton tabIndex={3} aria-label="CloseButton" onClick={handleCloseModal} />
              </Box>

              <Box style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>Select queue to switchboard</h2>
              </Box>

              <form>
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px', margin: 0, padding: 0 }}>
                  {filteredQueues &&
                    filteredQueues.map(queue => {
                      return (
                        <div key={queue.key} style={{ padding: '1px' }}>
                          <input
                            type="radio"
                            id={queue.key}
                            name="switchboardQueue"
                            value={queue.key}
                            checked={selectedQueue === queue.key}
                            onChange={e => {
                              const newValue = e.target.value;
                              console.log('>>> Radio onChange:', newValue);
                              setSelectedQueue(newValue);
                              selectedQueueRef.current = newValue;
                            }}
                          />
                          <label htmlFor={queue.key}>{queue.friendly_name}</label>
                        </div>
                      );
                    })}
                </Box>

                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '20px',
                    gap: '10px',
                  }}
                >
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      padding: '8px 15px',
                      background: '#EEEEEE',
                      border: 'none',
                      borderRadius: '3px',
                    }}
                  >
                    Cancel
                  </Button>
                  <StyledNextStepButton
                    onClick={() => {
                      const currentQueue = selectedQueue || selectedQueueRef.current;
                      console.log('>>> Activate button clicked. Queue:', currentQueue);

                      if (currentQueue) {
                        handleSwitchboarding(currentQueue);
                      } else {
                        alert('Please select a queue first');
                      }
                    }}
                  >
                    Activate Switchboarding
                  </StyledNextStepButton>
                </Box>
              </form>
            </NonDataCallTypeDialogContainer>
          </TabPressWrapper>
        </CloseTaskDialog>
      )}
    </>
  );
};
