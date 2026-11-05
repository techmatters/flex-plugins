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
import { useDispatch, useSelector } from 'react-redux';
import { Actions } from '@twilio/flex-ui';
import { TaskListItemChildrenProps } from '@twilio/flex-ui/src/components/TaskList/TaskListItem';

import { RootState } from '../../states';
import { selectQueueGreeting } from '../../states/configuration/selectDefinitions';
import { newSetQueueGreetingDismissedAction } from '../../states/routing/actions';
import { GreetingPill, GuidancePillContainer } from './styles';

const MAX_PILL_TEXT_LENGTH = 20;

type Props = TaskListItemChildrenProps;

const QueueGreetingPill: React.FC<Props> = ({ task, selectedTaskSid, onSelected }) => {
  const dispatch = useDispatch();
  const queueGreeting = useSelector((state: RootState) => selectQueueGreeting(state, task?.queueName));
  if (!queueGreeting) return null;

  const selectTask = () => {
    if (onSelected) onSelected(task.sid);
  };

  const reopenGreeting = () => {
    dispatch(newSetQueueGreetingDismissedAction(task.taskSid, false));
    Actions.invokeAction('SelectTask', { sid: task.sid });
  };

  return (
    <GuidancePillContainer isSelected={Boolean(task) && task.sid === selectedTaskSid} onClick={selectTask}>
      <GreetingPill as="button" variant="guidance" onClick={reopenGreeting}>
        {queueGreeting.pillText.slice(0, MAX_PILL_TEXT_LENGTH)}
      </GreetingPill>
    </GuidancePillContainer>
  );
};

QueueGreetingPill.displayName = 'QueueGreetingPill';

export default QueueGreetingPill;
