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

import { ResourceSubtitle } from '../../../styles/ReferrableResources';

type Props = {
  operations: any;
};

const OperatingHours: React.FC<Props> = ({ operations }) => {
  console.log('>>> operations', operations);
  return (
    <table>
      <tbody>
        {Object.keys(operations).map(key => {
          const dayData = operations[key][0];
          const { hoursOfOperation, descriptionOfHours, day } = dayData.info;

          if (hoursOfOperation) {
            return (
              // <li style={{ listStyle: 'none' }} key={key}>
              <tr key={key}>
                <td style={{ padding: '0 4px' }}>
                  <ResourceSubtitle>{day}</ResourceSubtitle>
                </td>
                <td style={{ padding: '0 4px' }}>
                  {hoursOfOperation}
                  <br />
                  {descriptionOfHours}
                </td>
              </tr>
              // </li>
            );
          }
          return (
            // <li style={{ listStyle: 'none' }} key={key}>
            <tr key={key}>
              <td style={{ padding: '0 4px' }}>
                <ResourceSubtitle>{day}</ResourceSubtitle>
              </td>
              <td style={{ padding: '0 4px' }}>Closed</td>
            </tr>
            // </li>
          );
        })}
      </tbody>
    </table>
  );
};

OperatingHours.displayName = 'OperatingHours';

// eslint-disable-next-line import/no-unused-modules
export default OperatingHours;
