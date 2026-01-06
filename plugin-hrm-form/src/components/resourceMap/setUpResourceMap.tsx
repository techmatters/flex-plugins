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

import ResourceMapSideLink from './ResourceMapSideLink';
import ResourceMap from './ResourceMap';

export const setUpResourceMap = () => {
  Flex.ViewCollection.Content.add(
    <Flex.View name="resource-map" key="resource-map-view">
      <ResourceMap />
    </Flex.View>,
  );

  Flex.SideNav.Content.add(
    <ResourceMapSideLink
      key="ResourceMapSideLink"
      onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'resource-map' })}
      reserveSpace={false}
      showLabel={true}
    />,
  );
};
