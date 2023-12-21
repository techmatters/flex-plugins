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

/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import type { FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import { TimelineRow, TimelineText, TimelineLabel, ViewButton, RowItemContainer } from './styles';
import { Box, HiddenText } from '../../styles/HrmStyles';
import { formatValue } from '../common/forms/helpers';
import type { Incident } from '../../types/types';

type OwnProps = {
  definition: FormDefinition;
  values: Incident; // expand this type to make this reusable (perpetrators, hh)
  layoutDefinition: LayoutDefinition;
  onClickView: () => void;
};

const RowItem: React.FC = ({ children }) => <RowItemContainer style={{ flex: 1 }}>{children}</RowItemContainer>;
RowItem.displayName = 'RowItem';

const TimelineInformationRow: React.FC<OwnProps> = ({ definition, values, layoutDefinition, onClickView }) => {
  return (
    <TimelineRow>
      {layoutDefinition.previewFields.map((name, index) => {
        const fieldDef = definition.find(e => e.name === name);
        const layout = layoutDefinition.layout[name];
        const formattedValue = formatValue(layout)(values[fieldDef.name]);

        return (
          <RowItem key={`item-${fieldDef.label}-${index}`}>
            <HiddenText>
              <Template code={fieldDef.label} />
            </HiddenText>
            <div style={{ display: 'inline-block' }}>
              {layout.includeLabel && <TimelineLabel>{fieldDef.label}: </TimelineLabel>}
              <TimelineText>{formattedValue}</TimelineText>
            </div>
          </RowItem>
        );
      })}
      <RowItem>
        <Box marginLeft="auto">
          <ViewButton onClick={onClickView} data-testid="Case-InformationRow-ViewButton">
            <Template code="Case-ViewButton" />
          </ViewButton>
        </Box>
      </RowItem>
    </TimelineRow>
  );
};

TimelineInformationRow.displayName = 'TimelineInformationRow';

export default TimelineInformationRow;
