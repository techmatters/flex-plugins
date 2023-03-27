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

import { Resource } from '../../../types/types';
import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceSubtitle,
} from '../../../styles/ReferrableResources';
import ExpandableSection from './ExpandableSection';
import OperatingHours from './OperatingHours';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';

type Props = {
  site: Resource['attributes']['site'];
};

const SiteDetails: React.FC<Props> = ({ site }) => {
  /*
   * const phoneTypes = [
   *   { type: 'tollFree', label: 'Toll Free' },
   *   { type: 'hotline', label: 'Hotline' },
   *   { type: 'outOfAreaLine', label: 'Out of Area Line' },
   *   { type: 'afterHoursLine', label: 'After Hours Line' },
   *   { type: 'businessLine', label: 'Business Line' },
   *   { type: 'fax', label: 'Fax' },
   *   { type: 'tty', label: 'TTY' },
   * ];
   */

  return (
    <div>
      {site.map(singleSite => {
        const { siteId, name, location, email, operations, isActive } = singleSite;
        return (
          <ExpandableSection key={siteId} title={name}>
            <ResourceAttributeWithPrivacy isPrivate={false}>
              {/* <ResourceAttributeWithPrivacy isPrivate={isLocationPrivate}> */}
              <ResourceAttributeDescription>Contact Info</ResourceAttributeDescription>
              <ResourceAttributeContent>
                {location.address1}. {location.address2}
                <br />
                {location.city}, {location.county}
                <br />
                {location.province}, {location.postalCode}. {location.country}
              </ResourceAttributeContent>
            </ResourceAttributeWithPrivacy>
            <ResourceAttributeContent>{email}</ResourceAttributeContent>
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

SiteDetails.displayName = 'SiteDetails';

// eslint-disable-next-line import/no-unused-modules
export default SiteDetails;
