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
import { Modal } from '@material-ui/core';

import { Box, SaveAndEndButton, StyledNextStepButton, TertiaryButton } from '../../styles';
import { CloseButton, NonDataCallTypeDialogContainer, CloseTaskDialog } from '../callTypeButtons/styles';
import TabPressWrapper from '../TabPressWrapper';
import { SwitchboardSyncState } from 'hrm-types';
import {
  ModalPaper,
  ModalTitle,
  CloseButtonWrapper,
  HeaderBox,
  QueueGridContainer,
  QueueOption,
  RadioCircle,
  RadioDot,
  QueueOptionLabel,
  HiddenInput,
  ButtonGroup,
  StyledFormControl,
  DialogContainer,
  DialogTitle,
  StatusTextContainer,
} from './styles';
import { Template } from '@twilio/flex-ui';

type Queue = {
  key: string;
  friendly_name: string;
};

type SelectQueueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (queue: string) => void;
  queues: Queue[];
};

export const SelectQueueModal: React.FC<SelectQueueModalProps> = ({ isOpen, onClose, onSelect, queues }) => {
  const [selectedQueue, setSelectedQueue] = React.useState<string | null>(null);

  const handleRadioChange = (value: string) => {
    setSelectedQueue(value);
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="queue-selection-modal-title">
      <ModalPaper>
        <CloseButtonWrapper>
          <CloseButton tabIndex={3} aria-label="CloseButton" onClick={onClose} />
        </CloseButtonWrapper>

        <HeaderBox>
          <ModalTitle id="queue-selection-modal-title">
            <Template code="Switchboard-SelectQueueModalTitle" />
          </ModalTitle>
        </HeaderBox>

        <StyledFormControl>
          <QueueGridContainer>
            {queues &&
              [...queues]
                .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
                .map(queue => (
                  <QueueOption
                    key={queue.key}
                    selected={selectedQueue === queue.key}
                    onClick={() => handleRadioChange(queue.key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRadioChange(queue.key);
                      }
                    }}
                    role="radio"
                    aria-checked={selectedQueue === queue.key}
                    tabIndex={0}
                  >
                    <RadioCircle>
                      {selectedQueue === queue.key && <RadioDot />}
                    </RadioCircle>
                    <QueueOptionLabel
                      id={`queue-label-${queue.key}`}
                      htmlFor={`queue-radio-${queue.key}`}
                    >
                      {queue.friendly_name}
                    </QueueOptionLabel>
                    <HiddenInput
                      type="radio"
                      id={`queue-radio-${queue.key}`}
                      name="queue-selection"
                      value={queue.key}
                      checked={selectedQueue === queue.key}
                      onChange={() => handleRadioChange(queue.key)}
                      aria-labelledby={`queue-label-${queue.key}`}
                    />
                  </QueueOption>
                ))}
          </QueueGridContainer>
        </StyledFormControl>

        <ButtonGroup>
          <TertiaryButton
            type="button"
            onClick={onClose}
          >
            Cancel
          </TertiaryButton>
          <StyledNextStepButton
            onClick={() => {
              const currentQueue = selectedQueue;
              if (currentQueue) {
                onSelect(currentQueue);
              } else {
                alert('Please select a queue first');
              }
            }}
          >
            Activate Switchboarding
          </StyledNextStepButton>
        </ButtonGroup>
      </ModalPaper>
    </Modal>
  );
};

type TurnOffSwitchboardDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  switchboardSyncState: SwitchboardSyncState | null;
  renderStatusText: (queueKey: string, startTime: string | null) => React.ReactNode;
};

export const TurnOffSwitchboardDialog: React.FC<TurnOffSwitchboardDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  switchboardSyncState,
  renderStatusText,
}) => {
  return (
    <CloseTaskDialog open={isOpen} onClose={onClose} width={500}>
      <TabPressWrapper>
        <NonDataCallTypeDialogContainer as={DialogContainer}>
          <CloseButtonWrapper>
            <CloseButton tabIndex={3} aria-label="CloseButton" onClick={onClose} />
          </CloseButtonWrapper>
          <HeaderBox>
            <DialogTitle id="turn-off-switchboard-title">
              Are you sure you want to turn off switchboarding?
            </DialogTitle>
          </HeaderBox>
          <StatusTextContainer>
            {renderStatusText(switchboardSyncState?.queueSid || '', switchboardSyncState?.startTime || null)}
          </StatusTextContainer>
          <ButtonGroup>
            <TertiaryButton type="button" onClick={onClose}>
              Cancel
            </TertiaryButton>
            <SaveAndEndButton onClick={onConfirm}>
              Turn Off Switchboarding
            </SaveAndEndButton>
          </ButtonGroup>
        </NonDataCallTypeDialogContainer>
      </TabPressWrapper>
    </CloseTaskDialog>
  );
};
