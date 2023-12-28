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
import { Template } from '@twilio/flex-ui';

import { KhpUiResource } from '../types';
import { ResourcePreviewAttributeContent, ResourceSubtitle } from '../styles';

type Props = {
  operations: KhpUiResource['attributes']['operations'];
  showDescriptionOfHours: boolean;
};

const OperatingHours: React.FC<Props> = ({ operations, showDescriptionOfHours }) => {
  return (
    <table>
      <tbody>
        {!operations ||
          (operations.length === 0 && (
            <tr>
              <td>
                <ResourcePreviewAttributeContent>
                  <Template code="Resources-View-MissingProperty" />
                </ResourcePreviewAttributeContent>
              </td>
            </tr>
          ))}
        {operations.map(day => {
          if (day.hoursOfOperation) {
            return (
              <tr key={day.key}>
                <td style={{ paddingRight: '4px', width: '0' }}>
                  <ResourceSubtitle>{day.day}</ResourceSubtitle>
                </td>
                <td style={{ padding: '0 4px', fontSize: '14px' }}>
                  <ResourcePreviewAttributeContent>
                    {day.hoursOfOperation}
                    {showDescriptionOfHours && (
                      <>
                        <br />
                        {day.descriptionOfHours}
                      </>
                    )}
                  </ResourcePreviewAttributeContent>
                </td>
              </tr>
            );
          }
          return (
            <tr key={day.day}>
              <td style={{ padding: '0 4px', width: '0' }}>
                <ResourceSubtitle>{day.day}</ResourceSubtitle>
              </td>
              <td style={{ padding: '0 4px', fontSize: '14px' }}>
                <ResourcePreviewAttributeContent>Closed</ResourcePreviewAttributeContent>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

OperatingHours.displayName = 'OperatingHours';

// eslint-disable-next-line import/no-unused-modules
export default OperatingHours;
