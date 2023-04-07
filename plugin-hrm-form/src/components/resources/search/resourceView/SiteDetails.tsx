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

import { KhpUiResource } from '../../types';
import { FontOpenSans } from '../../../../styles/HrmStyles';
import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceSubtitle,
} from '../../../../styles/ReferrableResources';
import ExpandableSection from './ExpandableSection';
import OperatingHours from './OperatingHours';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';

type Props = {
  site: KhpUiResource['attributes']['site'];
};

const SiteDetails: React.FC<Props> = ({ site }) => {
  return (
    <div>
      {site.map(singleSite => {
        const { siteId, name, location, email, operations, phoneNumbers, isLocationPrivate } = singleSite;

        return (
          <ExpandableSection key={siteId} title={name}>
            <ResourceAttributeWithPrivacy isPrivate={isLocationPrivate} description="Contact Info">
              <ResourceAttributeContent>
                {location.address1}. {location.address2}
                <br />
                {location.city}, {location.county}
                <br />
                {location.province}, {location.postalCode}. {location.country}
              </ResourceAttributeContent>
            </ResourceAttributeWithPrivacy>
            <ResourceAttributeContent>{email}</ResourceAttributeContent>
            <PhoneNumbersDisplay phoneNumbers={phoneNumbers} />
            <br />
            <ResourceAttributeContent>
              <ResourceAttributeDescription>Hours</ResourceAttributeDescription>
              <OperatingHours operations={operations} showDescriptionOfHours={true} />
            </ResourceAttributeContent>
          </ExpandableSection>
        );
      })}
    </div>
  );
};

const PhoneNumbersDisplay = ({ phoneNumbers }) => {
  const { businessLine, afterHoursLine, tty } = phoneNumbers;
  return (
    <ResourceAttributeContent>
      {businessLine && (
        <tr>
          <td style={{ padding: '0 4px', width: '0', lineBreak: 'anywhere' }}>
            <ResourceSubtitle>Business</ResourceSubtitle>
          </td>
          <td style={{ padding: '0 4px', fontSize: '12px' }}>
            <FontOpenSans>{businessLine}</FontOpenSans>
          </td>
        </tr>
      )}
      {afterHoursLine && (
        <tr>
          <td style={{ padding: '0 4px', width: '0' }}>
            <ResourceSubtitle>After Hours</ResourceSubtitle>
          </td>
          <td style={{ padding: '0 4px', fontSize: '12px' }}>
            <FontOpenSans>{afterHoursLine}</FontOpenSans>
          </td>
        </tr>
      )}
      {tty && (
        <tr>
          <td style={{ padding: '0 4px', width: '0' }}>
            <ResourceSubtitle>TTY</ResourceSubtitle>
          </td>
          <td style={{ padding: '0 4px', fontSize: '12px' }}>
            <FontOpenSans>{tty}</FontOpenSans>
          </td>
        </tr>
      )}
    </ResourceAttributeContent>
  );
};

SiteDetails.displayName = 'SiteDetails';

// eslint-disable-next-line import/no-unused-modules
export default SiteDetails;
