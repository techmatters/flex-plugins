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
import { useSelector } from 'react-redux';
import { ITask } from '@twilio/flex-ui';

import { RootState } from '../../states';
import { selectQueueGreeting } from '../../states/configuration/selectDefinitions';
import { GuidancePill } from './styles';

const MAX_PILL_TEXT_LENGTH = 20;

type Props = {
  task?: ITask;
};

const QueueGreetingPill: React.FC<Props> = ({ task }) => {
  const queueGreeting = useSelector((state: RootState) => selectQueueGreeting(state, task?.queueName));
  if (!queueGreeting) return null;

  return <GuidancePill>{queueGreeting.pillText.slice(0, MAX_PILL_TEXT_LENGTH)}</GuidancePill>;
};

QueueGreetingPill.displayName = 'QueueGreetingPill';

export default QueueGreetingPill;
