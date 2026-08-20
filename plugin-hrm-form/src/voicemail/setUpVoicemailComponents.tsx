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

import * as Flex from '@twilio/flex-ui';
import React from 'react';

import { channelTypes } from '../states/DomainConstants';
import VoicemailTaskPanel from './VoicemailTaskPanel';
import { lookupTranslation } from '../translations';

export const setUpVoicemailComponents = () => {
  Flex.TaskCanvasTabs.Content.add(
    <Flex.Tab key="voicemail-info-tab" label={lookupTranslation('TaskPanel-Tabs-Voicemail')}>
      <VoicemailTaskPanel key="voicemail-task-panel" />
    </Flex.Tab>,
    {
      sortOrder: -1,
      if: props => props.task.channelType === channelTypes.voicemail && !Flex.TaskHelper.isPending(props.task),
    },
  );

  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => props.task.channelType === channelTypes.voicemail,
  });
};
