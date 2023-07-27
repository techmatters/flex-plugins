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

import ReferrableResourceSideLink from './ReferrableResourceSideLink';
import { referrableResourcesEnabled } from '../../services/ResourceService';
import ReferrableResources from './ReferrableResources';

export const setUpReferrableResources = () => {
  console.log('[E2E-TEST]: referrableResourcesEnabled', { referrableResourcesEnabled: referrableResourcesEnabled() });
  if (referrableResourcesEnabled()) {
    Flex.ViewCollection.Content.add(
      <Flex.View name="referrable-resources" key="referrable-resources-view">
        <ReferrableResources />
      </Flex.View>,
    );

    Flex.SideNav.Content.add(
      <ReferrableResourceSideLink
        key="ReferrableResourceSideLink"
        onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'referrable-resources' })}
        reserveSpace={false}
        showLabel={true}
      />,
    );
  }
};
