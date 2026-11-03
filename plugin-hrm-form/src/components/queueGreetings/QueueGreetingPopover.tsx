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
import { useSelector } from 'react-redux';
import { ITask, Template } from '@twilio/flex-ui';
import Close from '@material-ui/icons/Close';

import { RootState } from '../../states';
import { selectQueueGreeting } from '../../states/configuration/selectDefinitions';
import { HeaderCloseButton } from '../../styles/buttons';
import { HiddenText } from '../../styles';
import {
  GuidancePopoverContainer,
  GuidancePopoverContent,
  GuidancePopoverHeader,
  GuidancePopoverTitle,
} from './styles';

const MAX_TITLE_LENGTH = 60;
const MAX_CONTENT_LENGTH = 300;

type Props = {
  tasks?: Map<string, ITask>;
  selectedTaskSid?: string;
};

/**
 * Shows the greeting configured for the selected task's queue, until the counsellor dismisses it for that task
 */
const QueueGreetingPopover: React.FC<Props> = ({ tasks, selectedTaskSid }) => {
  const [dismissedTaskSids, setDismissedTaskSids] = useState<string[]>([]);
  const selectedTask = selectedTaskSid ? tasks?.get(selectedTaskSid) : undefined;
  const queueGreeting = useSelector((state: RootState) => selectQueueGreeting(state, selectedTask?.queueName));

  if (!queueGreeting || dismissedTaskSids.includes(selectedTaskSid)) return null;

  const dismiss = () => setDismissedTaskSids(sids => [...sids, selectedTaskSid]);

  return (
    <GuidancePopoverContainer aria-labelledby="queue-greeting-title">
      <GuidancePopoverHeader>
        <GuidancePopoverTitle id="queue-greeting-title">
          {queueGreeting.popoverTitle.slice(0, MAX_TITLE_LENGTH)}
        </GuidancePopoverTitle>
        <HeaderCloseButton onClick={dismiss} data-testid="QueueGreeting-CloseButton">
          <HiddenText>
            <Template code="CloseButton" />
          </HiddenText>
          <Close style={{ fontSize: 20, color: '#192b33' }} />
        </HeaderCloseButton>
      </GuidancePopoverHeader>
      <GuidancePopoverContent>{queueGreeting.popoverContent.slice(0, MAX_CONTENT_LENGTH)}</GuidancePopoverContent>
    </GuidancePopoverContainer>
  );
};

QueueGreetingPopover.displayName = 'QueueGreetingPopover';

export default QueueGreetingPopover;
