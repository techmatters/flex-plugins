/**
 *Copyright (C) 2021-2023 Technology Matters
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Affero General Public License as published
 *by the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU Affero General Public License for more details.
 *
 *You should have received a copy of the GNU Affero General Public License
 *along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';

import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceSubtitle,
} from '../../../styles/ReferrableResources';
import ExpandableSection from './ExpandableSection';
import OperatingHours from './OperatingHours';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';

type Props = {
  attributes: any;
};

const SiteDetails: React.FC<Props> = ({ attributes }) => {
  const phoneTypes = [
    { type: 'tollFree', label: 'Toll Free' },
    { type: 'hotline', label: 'Hotline' },
    { type: 'outOfAreaLine', label: 'Out of Area Line' },
    { type: 'afterHoursLine', label: 'After Hours Line' },
    { type: 'businessLine', label: 'Business Line' },
    { type: 'fax', label: 'Fax' },
    { type: 'tty', label: 'TTY' },
  ];

  return (
    <div>
      {Object.keys(attributes.site).map(siteId => {
        const { name, location, email, phone, operations, isLocationPrivate } = attributes.site[siteId];
        return (
          <ExpandableSection key={siteId} title={name[0].value}>
            <ResourceAttributeWithPrivacy isPrivate={isLocationPrivate}>
              <strong>Contact Info</strong>
              <ResourceAttributeContent>
                {location.address1[0].value}. {location.address2[0].value}
                <br />
                {location.city[0].value}, {location.county[0].value}
                <br />
                {location.province[0].info.name}, {location.postalCode[0].value}. {location.country[0].value}
              </ResourceAttributeContent>
            </ResourceAttributeWithPrivacy>
            <ResourceAttributeContent>{email[0].value}</ResourceAttributeContent>
            <ResourceAttributeContent>
              {phoneTypes.map(phoneType => {
                const { type, label } = phoneType;
                const phoneValue = phone[type][0].value;
                return (
                  <tr key={type}>
                    <td style={{ padding: '0 4px' }}>
                      <ResourceSubtitle>{label}:</ResourceSubtitle>
                    </td>
                    <td>{phoneValue}</td>
                  </tr>
                );
              })}
            </ResourceAttributeContent>
            <br />
            <ResourceAttributeContent>
              <ResourceAttributeDescription>Hours</ResourceAttributeDescription>
              <OperatingHours operations={operations} />
            </ResourceAttributeContent>
          </ExpandableSection>
        );
      })}
    </div>
  );
};

SiteDetails.displayName = 'SiteDetails';

// eslint-disable-next-line import/no-unused-modules
export default SiteDetails;
