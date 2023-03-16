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

import {
  PrivateResourceAttribute,
  ResourceAttributeContent,
  ResourceAttributeDescription,
} from '../../../styles/ReferrableResources';

type Props = {
  attributes: any;
};

const ViewResourceSiteDetails: React.FC<Props> = ({ attributes }) => {
  const siteId = Object.keys(attributes.site)[0];
  const { name, details, isActive, location, email, phone, operations } = attributes.site[siteId];

  console.log('>>> siteObj', name, details, isActive, location, email, phone, operations);
  const phoneTypes = [
    { type: 'tollFree', label: 'Toll Free' },
    { type: 'hotline', label: 'Hotline' },
    { type: 'outOfAreaLine', label: 'Out of Area Line' },
    { type: 'afterHoursLine', label: 'After Hours Line' },
    { type: 'businessLine', label: 'Business Line' },
    { type: 'fax', label: 'Fax' },
    { type: 'tty', label: 'TTY' },
  ];

  /*
   * const displayPhoneNumber = phoneType => {
   *   const phone = attributes.phone[phoneType];
   *   if (phone) {
   *     return `${phoneType}: ${phone[0].value}`;
   *   }
   *   return null;
   * };
   */

  return (
    <div>
      <h3>{name[0].value}</h3>
      Contact Info
      <ResourceAttributeContent>
        {location.address1[0].value}. {location.address2[0].value}
      </ResourceAttributeContent>
      <ResourceAttributeContent>
        {location.city[0].value}, {location.county[0].value}
      </ResourceAttributeContent>
      <ResourceAttributeContent>
        {location.province[0].info.name}, {location.postalCode[0].value}. {location.country[0].value}
      </ResourceAttributeContent>
      <ResourceAttributeContent>{email[0].value}</ResourceAttributeContent>
      <ResourceAttributeContent>
        {phoneTypes.map(phoneType => {
          const { type, label } = phoneType;
          const phoneValue = phone[type][0].value;

          return (
            <div key={type}>
              <strong>{label}:</strong> {phoneValue}
            </div>
          );
        })}
      </ResourceAttributeContent>
      <ResourceAttributeContent>
        <strong>Hours</strong>
        {Object.keys(operations).map(key => {
          const dayData = operations[key][0];
          const { day, hoursOfOperation, descriptionOfHours } = dayData.info;

          if (hoursOfOperation) {
            return (
              <li key={key}>
                {day}: {hoursOfOperation}; {descriptionOfHours}
              </li>
            );
          }
          return null;
        })}
      </ResourceAttributeContent>
    </div>
  );
};

ViewResourceSiteDetails.displayName = 'ViewResourceSiteDetails';

// eslint-disable-next-line import/no-unused-modules
export default ViewResourceSiteDetails;
