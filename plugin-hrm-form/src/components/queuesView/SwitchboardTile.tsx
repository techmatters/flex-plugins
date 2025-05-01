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
import { Switch } from '@material-ui/core';
import { useSelector } from 'react-redux';

import { getHrmConfig } from '../../hrmConfig';
import { Bold, Box, FormLabel, TertiaryButton, StyledNextStepButton } from '../../styles';
import { switchboardQueue } from '../../services/SwitchboardingService';
import SwitchboardIcon from '../common/icons/SwitchboardIcon';
import { RootState } from '../../states';
import { namespace, configurationBase } from '../../states/storeNamespaces';
import { SelectQueueModal, TurnOffSwitchboardModal } from './SwitchboardModals';

// eslint-disable-next-line import/no-unused-modules
export const setUpSwitchboard = () => {
  // if (!getAseloFeatureFlags().enable_switchboarding) return;
  QueuesStats.AggregatedQueuesDataTiles.Content.add(<SwitchboardTile key="switchboard" />, {
    sortOrder: -1,
  });
};

const SwitchboardTile = () => {
  const [isSwitchboarding, setIsSwitchboarding] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [switchboardingStartTime, setSwitchboardingStartTime] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Queue reference to avoid timing issues
  const selectedQueueRef = React.useRef<string | null>(null);

  // Config and state values
  const { workerSid } = getHrmConfig();
  const counselorsHash = useSelector((state: RootState) => state[namespace][configurationBase].counselors.hash);

  // Update queue reference when state changes
  useEffect(() => {
    selectedQueueRef.current = selectedQueue;
  }, [selectedQueue]);

  // Modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset selection when opening modal
    setSelectedQueue(null);
    selectedQueueRef.current = null;
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenConfirmationModal = () => setIsConfirmationModalOpen(true);
  const handleCloseConfirmationModal = () => setIsConfirmationModalOpen(false);

  // Core switchboarding logic
  const handleSwitchboarding = async (queue: string) => {
    if (!queue) return;

    try {
      await switchboardQueue(queue);
      const willBeActive = !isSwitchboarding;
      setIsSwitchboarding(willBeActive);

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

      setIsModalOpen(false);
      setSelectedQueue(queue);
    } catch (error) {
      console.error('Error in switchboarding:', error);
    }
  };

  const handleSwitchToggle = () => {
    if (isSwitchboarding && selectedQueue) {
      // If already switchboarding, open confirmation modal to turn it off
      handleOpenConfirmationModal();
    } else {
      // If not switchboarding, open the modal to select a queue
      handleOpenModal();
    }
  };

  // Get queue data
  const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;
  const filteredQueues = queues
    ? Object.values(queues).filter(
        (queue: any) => queue.friendly_name !== 'Survey' && queue.friendly_name !== 'Switchboard Queue',
      )
    : [];

  // Formatting helpers
  const getQueueName = (queueKey: string) =>
    filteredQueues.find((q: any) => q.key === queueKey)?.friendly_name || queueKey;

  const getSupervisorName = () =>
    counselorsHash && workerSid ? counselorsHash[workerSid] : Manager.getInstance().user.identity;

  const renderSwitchboardStatusText = (queueKey: string, startTime: string | null) => (
    <span>
      <Bold>{getQueueName(queueKey)}</Bold> calls are being switchboarded by supervisor{' '}
      <Bold>{getSupervisorName()}</Bold> since {startTime}
    </span>
  );

  const handleConfirmTurnOff = () => {
    if (selectedQueue) {
      handleSwitchboarding(selectedQueue);
      handleCloseConfirmationModal();
    }
  };

  return (
    <>
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
          <Switch checked={isSwitchboarding} onChange={handleSwitchToggle} color="primary" />
        </Box>

        <Box style={{ marginTop: '15px' }}>
          {isSwitchboarding && selectedQueue ? (
            <div>{renderSwitchboardStatusText(selectedQueue, switchboardingStartTime)}</div>
          ) : (
            <div>
              No queues are currently being switchboarded{' '}
            </div>
          )}
        </Box>
      </Box>

      <SelectQueueModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSwitchboarding}
        selectedQueue={selectedQueue}
        setSelectedQueue={setSelectedQueue}
        queueRef={selectedQueueRef}
        queues={filteredQueues}
      />

      <TurnOffSwitchboardModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmTurnOff}
        selectedQueue={selectedQueue}
        renderStatusText={renderSwitchboardStatusText}
        switchboardingStartTime={switchboardingStartTime}
      />
    </>
  );
};
