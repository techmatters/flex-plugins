/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { format } from 'date-fns';

import { TimelineRow, TimelineText, TimelineLabel, ViewButton, RowItemContainer } from '../../styles/case';
import { Box, HiddenText } from '../../styles/HrmStyles';
import type { FormDefinition } from '../common/forms/types';
import type { Incident } from '../../types/types';

type DisplayValue = { name: string; includeLabel: boolean; format?: 'date' };

const formatValue = (displayValue: DisplayValue) => (value: string | boolean) => {
  if (displayValue.format === 'date' && typeof value === 'string') return format(new Date(value), 'dd/MM/yyyy');

  return value;
};

type OwnProps = {
  definition: FormDefinition;
  values: Incident; // expand this type to make this reusable (perpetrators, hh)
  displayValues: DisplayValue[];
  onClickView: () => void;
};

const RowItem: React.FC = ({ children }) => <RowItemContainer style={{ flex: 1 }}>{children}</RowItemContainer>;
RowItem.displayName = 'RowItem';

const TimelineInformationRow: React.FC<OwnProps> = ({ definition, values, displayValues, onClickView }) => {
  return (
    <TimelineRow>
      {displayValues.map((v, index) => {
        const fieldDef = definition.find(e => e.name === v.name);
        const formattedValue = formatValue(v)(values[fieldDef.name]);

        return (
          <RowItem key={`item-${fieldDef.label}-${index}`}>
            <HiddenText>
              <Template code={fieldDef.label} />
            </HiddenText>
            <div style={{ display: 'inline-block' }}>
              {v.includeLabel && <TimelineLabel>{fieldDef.label}: </TimelineLabel>}
              <TimelineText>{formattedValue}</TimelineText>
            </div>
          </RowItem>
        );
      })}
      <RowItem>
        <Box marginLeft="auto" marginRight="10px">
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
