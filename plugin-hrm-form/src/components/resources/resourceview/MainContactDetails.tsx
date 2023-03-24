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

import { ResourceAttributeContent, ResourceAttributeSubDescription } from '../../../styles/ReferrableResources';

type Props = {
  mainContact: { name: string; title: string; phoneNumber: string; email: string };
};

const MainContactDetails: React.FC<Props> = ({ mainContact }) => {
  return (
    <>
      <ResourceAttributeSubDescription> Name </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{mainContact.name}</ResourceAttributeContent>
      <ResourceAttributeSubDescription> Title </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{mainContact.title}</ResourceAttributeContent>
      <ResourceAttributeSubDescription> Phone </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{mainContact.phoneNumber}</ResourceAttributeContent>
      <ResourceAttributeSubDescription> Email </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{mainContact.email}</ResourceAttributeContent>
    </>
  );
};

MainContactDetails.displayName = 'MainContactDetails';

export default MainContactDetails;
