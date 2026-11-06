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

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TaskCanvasChildrenProps, Template } from '@twilio/flex-ui';
import Close from '@material-ui/icons/Close';
import Popper from '@material-ui/core/Popper';
import type PopperJs from 'popper.js';

import { RootState } from '../../states';
import { selectQueueGreeting } from '../../states/configuration/selectDefinitions';
import { selectIsQueueGreetingOpen } from '../../states/routing/getRoute';
import { newSetQueueGreetingDismissedAction } from '../../states/routing/actions';
import { HeaderCloseButton } from '../../styles/buttons';
import { HiddenText } from '../../styles';
import {
  GuidancePopoverAnchor,
  GuidancePopoverContainer,
  GuidancePopoverContent,
  GuidancePopoverHeader,
  GuidancePopoverTitle,
} from './styles';

const MAX_TITLE_LENGTH = 60;
const MAX_CONTENT_LENGTH = 300;
// Keeps the popover clear of the call actions at the bottom of the task canvas
const DISTANCE_FROM_CANVAS_BOTTOM = 116;

type Props = TaskCanvasChildrenProps;

/**
 * Shows the greeting configured for the task's queue near the bottom of the task canvas.
 * The popover is rendered in a portal, positioned against an anchor placed at the bottom of the task canvas.
 * Popper only repositions on window resize and scroll events, so it is also repositioned whenever the task canvas
 * changes size (e.g. when Flex re-lays out its panels after a window resize, or the panel splitter is dragged).
 */
const QueueGreetingPopover: React.FC<Props> = ({ task }) => {
  const dispatch = useDispatch();
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);
  const popperRef = useRef<PopperJs | null>(null);
  const queueGreeting = useSelector((state: RootState) => selectQueueGreeting(state, task?.queueName));
  const isOpen = useSelector((state: RootState) => Boolean(task) && selectIsQueueGreetingOpen(state, task));

  useEffect(() => {
    const taskCanvas = anchorElement?.parentElement;
    if (!taskCanvas) return undefined;

    const resizeObserver = new ResizeObserver(() => popperRef.current?.update());
    resizeObserver.observe(taskCanvas);
    return () => resizeObserver.disconnect();
  }, [anchorElement]);

  if (!queueGreeting) return null;

  const dismiss = () => dispatch(newSetQueueGreetingDismissedAction(task.taskSid, true));

  return (
    <>
      <GuidancePopoverAnchor ref={setAnchorElement} />
      <Popper
        open={isOpen && Boolean(anchorElement)}
        anchorEl={anchorElement}
        popperRef={popperRef}
        placement="top"
        modifiers={{ offset: { offset: `0, ${DISTANCE_FROM_CANVAS_BOTTOM}` } }}
        style={{ zIndex: 10 }}
      >
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
      </Popper>
    </>
  );
};

QueueGreetingPopover.displayName = 'QueueGreetingPopover';

export default QueueGreetingPopover;
