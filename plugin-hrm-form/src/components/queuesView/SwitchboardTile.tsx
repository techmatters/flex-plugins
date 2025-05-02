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
import { Switch, CircularProgress, Tooltip } from '@material-ui/core';
import { useSelector } from 'react-redux';
import InfoIcon from '@material-ui/icons/Info';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import { getHrmConfig } from '../../hrmConfig';
import { Bold, Box } from '../../styles';
import { switchboardQueue } from '../../services/SwitchboardingService';
import SwitchboardIcon from '../common/icons/SwitchboardIcon';
import { RootState } from '../../states';
import { namespace, configurationBase } from '../../states/storeNamespaces';
import { SelectQueueModal, TurnOffSwitchboardDialog } from './SwitchboardModals';
import { SwitchboardState, subscribeSwitchboardState } from '../../utils/sharedState';

// eslint-disable-next-line import/no-unused-modules
export const setUpSwitchboard = () => {
  // if (!getAseloFeatureFlags().enable_switchboarding) return;
  QueuesStats.AggregatedQueuesDataTiles.Content.add(<SwitchboardTile key="switchboard" />, {
    sortOrder: -1,
  });
};

const SwitchboardTile = () => {
  const [switchboardState, setSwitchboardState] = useState<SwitchboardState | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const selectedQueueRef = React.useRef<string | null>(null);

  const { workerSid } = getHrmConfig();
  const counselorsHash = useSelector((state: RootState) => state[namespace][configurationBase].counselors.hash);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initSwitchboardSubscription = async () => {
      try {
        setIsLoading(true);
        unsubscribe = await subscribeSwitchboardState(state => {
          setSwitchboardState(state);
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error initializing switchboard subscription:', err);
        setError('Failed to connect to switchboard state. Please refresh the page or contact support.');
        setIsLoading(false);
      }
    };

    initSwitchboardSubscription();

    // Clean up subscription when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    selectedQueueRef.current = selectedQueue;
  }, [selectedQueue]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedQueue(null);
    selectedQueueRef.current = null;
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenConfirmationDialog = () => setIsConfirmationDialogOpen(true);
  const handleCloseConfirmationDialog = () => setIsConfirmationDialogOpen(false);

  const handleSwitchboarding = async (queue: string) => {
    if (!queue) return;

    try {
      setIsLoading(true);
      setError(null);
      await switchboardQueue(queue);
      setIsModalOpen(false);
      setSelectedQueue(queue);
    } catch (error) {
      console.error('Error in switchboarding:', error);
      setError('Failed to activate switchboarding. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToggle = () => {
    if (switchboardState?.isSwitchboardingActive) {
      // If already switchboarding, open confirmation modal to turn it off
      if (switchboardState.queueSid) {
        setSelectedQueue(switchboardState.queueSid);
        handleOpenConfirmationDialog();
      }
    } else {
      // If not switchboarding, open the modal to select a queue
      handleOpenModal();
    }
  };

  const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;
  const filteredQueues = queues
    ? Object.values(queues).filter(
        (queue: any) => queue.friendly_name !== 'Survey' && queue.friendly_name !== 'Switchboard Queue',
      )
    : [];

  const getQueueName = (queueKey: string) =>
    filteredQueues.find((q: any) => q.key === queueKey)?.friendly_name || queueKey;

  const getSupervisorName = (supervisorWorkerSid: string | null) => {
    if (!supervisorWorkerSid) return 'Unknown supervisor';
    console.log('>>>supervisorWorkerSid', supervisorWorkerSid, counselorsHash[supervisorWorkerSid]);
    return counselorsHash && counselorsHash[supervisorWorkerSid]
      ? counselorsHash[supervisorWorkerSid]
      : 'Unknown supervisor';
  };

  const renderSwitchboardStatusText = (
    queueName: string | null,
    startTime: string | null,
    supervisorName: string | null,
  ) => (
    <span>
      <Bold>{queueName}</Bold> calls are being switchboarded by supervisor <Bold>{supervisorName}</Bold> since{' '}
      {startTime}
    </span>
  );

  const handleConfirmTurnOff = () => {
    if (selectedQueue) {
      handleSwitchboarding(selectedQueue);
      handleCloseConfirmationDialog();
    }
  };

  const borderColor = switchboardState?.isSwitchboardingActive ? '#f8c000' : '#e1e3ea';
  const backgroundColor = switchboardState?.isSwitchboardingActive ? '#fff7de' : 'transparent';

  return (
    <>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          border: `2px solid ${borderColor}`,
          borderRadius: '4px',
          backgroundColor,
          fontFamily: 'Open Sans',
          position: 'relative',
        }}
        data-testid="switchboard-tile"
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
              borderRadius: '4px',
            }}
          >
            <CircularProgress size={40} />
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '10px' }}>
            <h1>Error</h1>
            {error}
          </div>
        )}

        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <SwitchboardIcon width="38" height="38" />
            <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Switchboarding: {switchboardState?.isSwitchboardingActive ? 'In Progress' : 'Off'}
            </h3>
          </Box>
          <Switch
            checked={switchboardState?.isSwitchboardingActive || false}
            onChange={handleSwitchToggle}
            color="primary"
            disabled={isLoading}
          />
        </Box>

        <Box style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
          {switchboardState?.isSwitchboardingActive && switchboardState.queueSid ? (
            <div>
              {renderSwitchboardStatusText(
                switchboardState.queueName,
                switchboardState.startTime,
                getSupervisorName(switchboardState.supervisorWorkerSid),
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              No queues are currently being switchboarded
              <Tooltip title="Learn more about switchboarding">
                <Box style={{ display: 'flex', marginLeft: '8px', cursor: 'pointer' }}>
                  <InfoIcon style={{ fontSize: '16px', marginRight: '2px' }} />
                  <OpenInNewIcon style={{ fontSize: '16px' }} />
                </Box>
              </Tooltip>
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

      <TurnOffSwitchboardDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
        onConfirm={handleConfirmTurnOff}
        selectedQueue={selectedQueue}
        renderStatusText={(queueKey, startTime) =>
          renderSwitchboardStatusText(
            getQueueName(queueKey),
            switchboardState?.startTime || startTime,
            getSupervisorName(workerSid),
          )
        }
        switchboardingStartTime={switchboardState?.startTime || null}
      />
    </>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default SwitchboardTile;
