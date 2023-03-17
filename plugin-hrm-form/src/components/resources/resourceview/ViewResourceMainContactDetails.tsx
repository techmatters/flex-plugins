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
  attributes: any;
};

const ViewResourceMainContactDetails: React.FC<Props> = ({ attributes }) => {
  const getValue = (keyName: string) => {
    if (keyName in attributes.mainContact) {
      const propVal = attributes.mainContact[keyName];
      if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
        return propVal[0].value;
      }
    }
    return null;
  };

  return (
    <>
      <ResourceAttributeSubDescription> Name </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{getValue('name')}</ResourceAttributeContent>
      <ResourceAttributeSubDescription> Title </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{getValue('title')}</ResourceAttributeContent>
      <ResourceAttributeSubDescription> Phone </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{getValue('phoneNumber')}</ResourceAttributeContent>
      <ResourceAttributeSubDescription> Email </ResourceAttributeSubDescription>
      <ResourceAttributeContent>{getValue('email')}</ResourceAttributeContent>
    </>
  );
};

ViewResourceMainContactDetails.displayName = 'ViewResourceMainContactDetails';

export default ViewResourceMainContactDetails;
