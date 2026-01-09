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

import * as Flex from '@twilio/flex-ui';
import React from 'react';

import CustomSideLinkSet from './CustomSideLinkSet';
import CustomEmbeddedLinkSet from './CustomEmbeddedLinkSet';

// eslint-disable-next-line import/no-unused-modules
export const setUpCustomSideLinks = () => {
  Flex.ViewCollection.Content.add(
    <Flex.View name="custom-link" key="custom-link-view">
      <CustomEmbeddedLinkSet />
    </Flex.View>,
  );
  Flex.SideNav.Content.add(<CustomSideLinkSet key="custom-link-set" />);
};
