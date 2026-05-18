/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Message } from '@twilio/conversations';
import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core/text';

import { getDaysOld } from '../utils/getDaysOld';
import {
  separatorContainerStyles,
  getSeparatorLineStyles,
  getSeparatorTextStyles,
} from './styles/MessageListSeparator.styles';
import { SeparatorType } from './definitions';

export const MessageListSeparator = ({
  message,
  separatorType,
}: {
  message: Message;
  separatorType: SeparatorType;
}) => {
  const getSeparatorText = () => {
    let separatorText;
    if (separatorType === 'new') {
      separatorText = 'New';
    } else {
      const daysOld = getDaysOld(message.dateCreated);
      if (daysOld === 0) {
        separatorText = 'Today';
      } else if (daysOld === 1) {
        separatorText = 'Yesterday';
      } else {
        separatorText = message.dateCreated.toLocaleDateString();
      }
    }

    return separatorText;
  };

  return (
    <Box {...separatorContainerStyles} data-test="new-message-separator" role="separator">
      <Box {...getSeparatorLineStyles(separatorType)} aria-hidden="true" />
      <Text as="p" {...getSeparatorTextStyles(separatorType)}>
        {getSeparatorText()}
      </Text>
      <Box {...getSeparatorLineStyles(separatorType)} aria-hidden="true" />
    </Box>
  );
};
