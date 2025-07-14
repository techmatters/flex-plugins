/**
 * Copyright (C) 2021-2025 Technology Matters
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
import { Template } from '@twilio/flex-ui';

import { ParticipantLabelContainer, ParticipantLabelText } from './Conference/ParticipantLabel/styles';
import { newHangUpByStateManager } from '../hangUpByState';

const HangUpByLabel: React.FC<TaskContextProps> = ({ task }) => (
  <ParticipantLabelContainer>
    <ParticipantLabelText className="ParticipantCanvas-Name">
      <Template code={`Conference-Wrapping-HangupBy/${newHangUpByStateManager().getForTask(task) ?? 'Customer'}`} />
    </ParticipantLabelText>
  </ParticipantLabelContainer>
);

HangUpByLabel.displayName = 'HangUpByLabel';

export default HangUpByLabel;
