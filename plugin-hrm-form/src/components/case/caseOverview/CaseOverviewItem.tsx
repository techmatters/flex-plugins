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
import { Template } from '@twilio/flex-ui';

import { DetailDescription, StyledInputField } from '../styles';
import { getTemplateStrings } from '../../../hrmConfig';

type CaseOverviewItemProps = {
  labelId: string;
  templateCode: string;
  inputId: string;
  value: string;
  color?: string;
};

const CaseOverviewItem: React.FC<CaseOverviewItemProps> = ({ labelId, templateCode, inputId, value, color }) => {
  const strings = getTemplateStrings();
  return (
    <div style={{ paddingRight: '20px' }}>
      <DetailDescription>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label id={labelId} htmlFor={inputId}>
          <Template code={templateCode} />
        </label>
      </DetailDescription>
      <StyledInputField
        data-testid={`Case-CaseOverview-${labelId}`}
        id={inputId}
        name={inputId}
        aria-labelledby={labelId}
        disabled
        value={strings[value] || value}
        color={color}
      />
    </div>
  );
};

export default CaseOverviewItem;