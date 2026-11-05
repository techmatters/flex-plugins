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
import { useDispatch, useSelector } from 'react-redux';
import { TaskCanvasChildrenProps } from '@twilio/flex-ui';

import { RootState } from '../../states';
import { selectQueueGreeting } from '../../states/configuration/selectDefinitions';
import { selectIsQueueGreetingOpen } from '../../states/routing/getRoute';
import { newSetQueueGreetingDismissedAction } from '../../states/routing/actions';
import { Popover } from '../../design-system/popovers/Popover';
import { GreetingPopoverAnchor } from './styles';

const MAX_TITLE_LENGTH = 60;
const MAX_CONTENT_LENGTH = 300;
// Keeps the popover clear of the call actions at the bottom of the task canvas
const DISTANCE_FROM_CANVAS_BOTTOM = 116;

type Props = TaskCanvasChildrenProps;

/**
 * Shows the greeting configured for the task's queue near the bottom of the task canvas,
 * in a guidance popover anchored to the bottom of the task canvas.
 */
const QueueGreetingPopover: React.FC<Props> = ({ task }) => {
  const dispatch = useDispatch();
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);
  const queueGreeting = useSelector((state: RootState) => selectQueueGreeting(state, task?.queueName));
  const isOpen = useSelector((state: RootState) => Boolean(task) && selectIsQueueGreetingOpen(state, task));

  if (!queueGreeting) return null;

  const dismiss = () => dispatch(newSetQueueGreetingDismissedAction(task.taskSid, true));

  return (
    <>
      <GreetingPopoverAnchor ref={setAnchorElement} />
      <Popover
        open={isOpen}
        anchorElement={anchorElement}
        title={queueGreeting.popoverTitle.slice(0, MAX_TITLE_LENGTH)}
        onClose={dismiss}
        variant="guidance"
        placement="top"
        distanceFromAnchor={DISTANCE_FROM_CANVAS_BOTTOM}
      >
        {queueGreeting.popoverContent.slice(0, MAX_CONTENT_LENGTH)}
      </Popover>
    </>
  );
};

QueueGreetingPopover.displayName = 'QueueGreetingPopover';

export default QueueGreetingPopover;
