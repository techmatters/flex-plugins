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
  return (
    <CloseTaskDialog open={isOpen} onClose={onClose} width={700}>
      <TabPressWrapper>
        <NonDataCallTypeDialogContainer style={{ position: 'relative', maxWidth: '700px', padding: '20px' }}>
          <Box style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <CloseButton tabIndex={3} aria-label="CloseButton" onClick={onClose} />
          </Box>

          <Box style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>Select queue to switchboard</h2>
          </Box>

          <form>
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
                    <div key={queue.key} style={{ marginBottom: '10px' }}>
                      <FormLabel htmlFor={queue.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                            queueRef.current = newValue;
                          }}
                          style={{
                            margin: '0 7px 0 0',
                            width: '12px',
                            height: '12px',
                            border: '2px solid #080808',
                            borderRadius: '50%',
                            backgroundColor: '#f4f4f4',
                          }}
                        />
                        {queue.friendly_name}
                      </FormLabel>
                    </div>
                  ))}
            </Box>

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
          </form>
        </NonDataCallTypeDialogContainer>
      </TabPressWrapper>
    </CloseTaskDialog>
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
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', maxWidth: '400px', textAlign: 'center' }}>
              Are you sure you want to turn off switchboarding?
            </h2>
          </Box>
          <Box style={{ margin: '20px' }}>{renderStatusText(selectedQueue || '', switchboardingStartTime)}</Box>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignSelf: 'flex-end',
              margin: '20px',
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
