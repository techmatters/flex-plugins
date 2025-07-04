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

/* eslint-disable react/prop-types */
import React from 'react';
import { withTaskContext, Template } from '@twilio/flex-ui';

const RefreshMessage: React.FC<TaskContextProps> = ({ task }) => {
  if (!task) {
    return null;
  }

  return (
    <span style={{ alignSelf: 'center', fontSize: '14px' }}>
      <Template code="Transfer-ErrorLoadingMessages" />
    </span>
  );
};

RefreshMessage.displayName = 'RefreshMessage';

export default withTaskContext(RefreshMessage);
