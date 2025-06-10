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
import { QueuesStats, Manager, Template } from '@twilio/flex-ui';
import { Switch, CircularProgress, Tooltip } from '@material-ui/core';
import { useSelector } from 'react-redux';
import InfoIcon from '@material-ui/icons/Info';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { SWITCHBOARD_QUEUE_NAME } from 'hrm-types';

import { getHrmConfig } from '../../hrmConfig';
import { Box } from '../../styles';
import SwitchboardIcon from '../common/icons/SwitchboardIcon';
import { RootState } from '../../states';
import { namespace, configurationBase } from '../../states/storeNamespaces';
import { SelectQueueModal, TurnOffSwitchboardDialog } from './QueueSelectionModals';
import { SwitchboardTileBox, LoadingContainer } from './styles';
import { useSwitchboard } from '../../states/switchboard/useSwitchboard';

export const setUpSwitchboard = () => {
  QueuesStats.AggregatedQueuesDataTiles.Content.add(<SwitchboardTile key="switchboard" />, {
    sortOrder: -1,
  });
};

const SwitchboardTile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const { workerSid } = getHrmConfig();
  const counselorsHash = useSelector((state: RootState) => state[namespace][configurationBase].counselors.hash);

  const {
    state: { error, isLoading, switchboardSyncState },
    toggleSwitchboard,
  } = useSwitchboard();

  const { isSwitchboardingActive = false, queueSid, queueName, startTime, supervisorWorkerSid } =
    switchboardSyncState || {};

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenConfirmationDialog = () => {
    setIsConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
  };

  const handleSwitchboarding = async (queueSid: string) => {
    if (!queueSid) {
      return;
    }

    try {
      const operation = isSwitchboardingActive ? 'disable' : 'enable';
      await toggleSwitchboard({ queueSid, supervisorWorkerSid: workerSid, operation });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error in switchboarding:', error);
    }
  };

  const handleSwitchToggle = () => {
    if (isSwitchboardingActive) {
      if (queueSid) {
        handleOpenConfirmationDialog();
      }
    } else {
      handleOpenModal();
    }
  };

  const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;
  const filteredQueues = queues
    ? Object.values(queues).filter(
        (queue: any) => queue.friendly_name !== 'Survey' && queue.friendly_name !== SWITCHBOARD_QUEUE_NAME,
      )
    : [];

  const getQueueName = (queueKey: string) => {
    return filteredQueues.find((q: any) => q.key === queueKey)?.friendly_name || queueKey;
  };

  const getSupervisorName = (supervisorWorkerSid: string | null) => {
    if (!supervisorWorkerSid) return 'Unknown supervisor';
    return counselorsHash && counselorsHash[supervisorWorkerSid]
      ? counselorsHash[supervisorWorkerSid]
      : 'Unknown supervisor';
  };

  const renderSwitchboardStatusText = (
    queueName: string | null,
    startTime: string | null,
    supervisorName: string | null,
  ) => {
    const formattedTime = startTime
      ? new Date(startTime).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';

    return (
      <>
        <Template
          code="Switchboard-QueueSwitchboardedStatus"
          queueName={queueName || ''}
          supervisorName={supervisorName || ''}
          startTime={formattedTime}
        />
      </>
    );
  };

  const handleConfirmTurnOff = () => {
    if (isSwitchboardingActive && queueSid) {
      handleSwitchboarding(queueSid);
      handleCloseConfirmationDialog();
    }
  };

  return (
    <>
      <SwitchboardTileBox isActive={isSwitchboardingActive} data-testid="switchboard-tile">
        {isLoading && (
          <LoadingContainer>
            <CircularProgress size={40} />
          </LoadingContainer>
        )}

        {error && <div style={{ marginBottom: '10px', color: 'red' }}>{error}</div>}

        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <SwitchboardIcon width="38" height="38" />
            <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>
              <Template code={isSwitchboardingActive ? 'Switchboard-StatusActive' : 'Switchboard-StatusInactive'} />
            </h3>
          </Box>
          <Switch checked={isSwitchboardingActive} onChange={handleSwitchToggle} color="primary" disabled={isLoading} />
        </Box>

        <Box style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
          {isSwitchboardingActive && queueSid ? (
            <div>{renderSwitchboardStatusText(queueName, startTime, getSupervisorName(supervisorWorkerSid))}</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Template code="Switchboard-NoQueuesSwitchboarded" />
              <Tooltip title="Learn more about switchboarding">
                <Box style={{ display: 'flex', marginLeft: '8px', cursor: 'pointer' }}>
                  <InfoIcon style={{ fontSize: '16px', marginRight: '2px' }} />
                  <OpenInNewIcon style={{ fontSize: '16px' }} />
                </Box>
              </Tooltip>
            </div>
          )}
        </Box>
      </SwitchboardTileBox>

      <SelectQueueModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSwitchboarding}
        queues={filteredQueues}
      />

      <TurnOffSwitchboardDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
        onConfirm={handleConfirmTurnOff}
        switchboardSyncState={{ isSwitchboardingActive, queueSid, queueName, startTime, supervisorWorkerSid }}
        renderStatusText={(queueKey, startTime) =>
          renderSwitchboardStatusText(getQueueName(queueKey), startTime, getSupervisorName(supervisorWorkerSid))
        }
      />
    </>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default SwitchboardTile;
