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

import * as React from 'react';

import customContactComponentRegistry, { isParametersWithContactId } from '../forms/customContactComponentRegistry';

type OwnProps = {
  taskSid: string;
};

const ReferralList: React.FC<OwnProps> = ({ taskSid }) => {
  return <div>Referral list for task: {taskSid}</div>;
};

customContactComponentRegistry.register('referralList', parameters => {
  if (!isParametersWithContactId(parameters)) {
    return <ReferralList taskSid={parameters.taskSid} />;
  }
  // Not supported for contact ID yet
  return null;
});
