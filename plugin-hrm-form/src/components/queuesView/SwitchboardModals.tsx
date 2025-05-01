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

import React from 'react';
import { Modal, Paper, FormControl, FormControlLabel } from '@material-ui/core';

import { Box, SaveAndEndButton, StyledNextStepButton, TertiaryButton, FormLabel } from '../../styles';
import { CloseButton, NonDataCallTypeDialogContainer, CloseTaskDialog } from '../callTypeButtons/styles';
import TabPressWrapper from '../TabPressWrapper';

type Queue = {
  key: string;
  // eslint-disable-next-line camelcase
  friendly_name: string;
};

type SelectQueueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (queue: string) => void;
  selectedQueue: string | null;
  setSelectedQueue: (queue: string) => void;
  queueRef: React.MutableRefObject<string | null>;
  queues: Queue[];
};

export const SelectQueueModal: React.FC<SelectQueueModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedQueue,
  setSelectedQueue,
  queueRef,
  queues,
}) => {
  // Define custom radio button handler
  const handleRadioChange = (value: string) => {
    console.log('>>> Direct handler clicked:', value);
    setSelectedQueue(value);
    queueRef.current = value;
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="queue-selection-modal-title">
      <Paper
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '700px',
          width: '90%',
          backgroundColor: 'white',
          padding: '20px',
          outline: 'none',
          borderRadius: '4px',
        }}
      >
        <Box style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <CloseButton tabIndex={3} aria-label="CloseButton" onClick={onClose} />
        </Box>

        <Box style={{ marginBottom: '20px' }}>
          <h2 id="queue-selection-modal-title" style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
            Select queue to switchboard
          </h2>
        </Box>

        <FormControl component="fieldset" style={{ width: '100%' }}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2px 30px',
              margin: '0 10px',
              padding: '10px 0',
              width: '100%',
            }}
          >
            {queues &&
              [...queues]
                .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
                .map(queue => (
                  <div 
                    key={queue.key} 
                    onClick={() => handleRadioChange(queue.key)}
                    style={{ 
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid #000',
                        marginRight: '8px',
                        position: 'relative',
                        backgroundColor: 'white',
                      }}
                    >
                      {selectedQueue === queue.key && (
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#000',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      )}
                    </div>
                    <label style={{ cursor: 'pointer' }}>{queue.friendly_name}</label>
                  </div>
                ))}
          </Box>
        </FormControl>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
            gap: '10px',
          }}
        >
          <TertiaryButton
            type="button"
            onClick={onClose}
            style={{
              background: '#EEEEEE',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Cancel
          </TertiaryButton>
          <StyledNextStepButton
            onClick={() => {
              const currentQueue = selectedQueue || queueRef.current;
              if (currentQueue) {
                onSelect(currentQueue);
              } else {
                alert('Please select a queue first');
              }
            }}
          >
            Activate Switchboarding
          </StyledNextStepButton>
        </Box>
      </Paper>
    </Modal>
  );
};

type TurnOffSwitchboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedQueue: string | null;
  renderStatusText: (queueKey: string, startTime: string | null) => React.ReactNode;
  switchboardingStartTime: string | null;
};

export const TurnOffSwitchboardModal: React.FC<TurnOffSwitchboardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedQueue,
  renderStatusText,
  switchboardingStartTime,
}) => {
  return (
    <CloseTaskDialog open={isOpen} onClose={onClose} width={500}>
      <TabPressWrapper>
        <NonDataCallTypeDialogContainer style={{ position: 'relative', maxWidth: '500px', padding: '20px' }}>
          <Box style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <CloseButton tabIndex={3} aria-label="CloseButton" onClick={onClose} />
          </Box>

          <Box style={{ marginBottom: '20px' }}>
            <h2 id="turn-off-switchboard-title" style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              Are you sure you want to turn off switchboarding?
            </h2>
          </Box>
          <Box style={{ margin: '20px' }}>{renderStatusText(selectedQueue || '', switchboardingStartTime)}</Box>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
              gap: '10px',
            }}
          >
            <TertiaryButton
              type="button"
              onClick={onClose}
              style={{
                background: '#EEEEEE',
                border: 'none',
                borderRadius: '3px',
              }}
            >
              Cancel
            </TertiaryButton>
            <SaveAndEndButton onClick={onConfirm}>Turn Off Switchboarding</SaveAndEndButton>
          </Box>
        </NonDataCallTypeDialogContainer>
      </TabPressWrapper>
    </CloseTaskDialog>
  );
};
