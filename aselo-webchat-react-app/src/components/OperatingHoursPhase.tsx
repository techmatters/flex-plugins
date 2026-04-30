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

import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core/text';
import { useSelector } from 'react-redux';

import { AppState } from '../store/definitions';
import { Header } from './Header';
import { formStyles, titleStyles } from './styles/PreEngagementFormPhase.styles';
import LocalizedTemplate from '../localization/LocalizedTemplate';

export const OperatingHoursPhase = () => {
  const operatingHoursMessage = useSelector((state: AppState) => state.session.operatingHoursMessage);

  const messageKey = operatingHoursMessage ?? 'OperatingHours-Closed-Message';

  return (
    <>
      <Header />
      <Box data-test="operating-hours-container" {...formStyles}>
        <Text {...titleStyles} as="p">
          <LocalizedTemplate code={messageKey} renderAsHtml="true" />
        </Text>
      </Box>
    </>
  );
};
