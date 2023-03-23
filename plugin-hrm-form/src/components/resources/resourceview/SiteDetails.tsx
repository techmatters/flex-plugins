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

import { ResourceAttributeContent } from '../../../styles/ReferrableResources';
import ExpandableSection from './ExpandableSection';
import OperatingHours from './OperatingHours';

type Props = {
  attributes: any;
};

const SiteDetails: React.FC<Props> = ({ attributes }) => {
  console.log('>>> site info', attributes);

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
            {/* <h3>{name[0].value}</h3> */}
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
            <br />
            <ResourceAttributeContent>
              <strong>Hours</strong>
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
