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
import { Template } from '@twilio/flex-ui';

import { KhpUiResource } from '../types';
import { ResourceAttributeContent, ResourceSubtitle } from '../../../styles/ReferrableResources';

type Props = {
  mainContact: KhpUiResource['attributes']['mainContact'];
};

const orPlaceholder = (value: string | undefined) => value || <Template code="Resources-View-MissingProperty" />;

const MainContactDetails: React.FC<Props> = ({ mainContact: { name, title, phoneNumber, email } }) => {
  return (
    <>
      <ResourceSubtitle>Name </ResourceSubtitle>
      <ResourceAttributeContent>{orPlaceholder(name)}</ResourceAttributeContent>
      <ResourceSubtitle>Title </ResourceSubtitle>
      <ResourceAttributeContent>{orPlaceholder(title)}</ResourceAttributeContent>
      <ResourceSubtitle>Phone </ResourceSubtitle>
      <ResourceAttributeContent>{orPlaceholder(phoneNumber)}</ResourceAttributeContent>
      <ResourceSubtitle>Email </ResourceSubtitle>
      <ResourceAttributeContent>{orPlaceholder(email)}</ResourceAttributeContent>
    </>
  );
};

MainContactDetails.displayName = 'MainContactDetails';

export default MainContactDetails;
