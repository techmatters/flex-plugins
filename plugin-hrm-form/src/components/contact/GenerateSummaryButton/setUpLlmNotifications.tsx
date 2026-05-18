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
import { Notifications, NotificationType, Template } from '@twilio/flex-ui';

export const LlmNotifications = {
  SummaryGenerationErrorNotification: 'LlmNotifications_SummaryGenerationErrorNotification',
};

type ErrorMessageComponentProps = {
  notificationContext?: { error: Error };
};

const ErrorMessage: React.FC<ErrorMessageComponentProps> = ({ notificationContext }) => (
  <Template
    code="LlmAssistant-Notifications-SummaryGenerationError"
    errorMessage={notificationContext?.error?.message}
  />
);

export const setupLlmNotifications = () => {
  Notifications.registerNotification({
    id: LlmNotifications.SummaryGenerationErrorNotification,
    type: NotificationType.error,
    timeout: 0,
    closeButton: true,
    content: <ErrorMessage />,
  });
};
