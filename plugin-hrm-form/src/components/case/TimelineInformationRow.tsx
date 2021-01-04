/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { TimelineRow, TimelineText, TimelineLabel, ViewButton, RowItemContainer } from '../../styles/case';
import { Box, HiddenText } from '../../styles/HrmStyles';
import { formatValue } from '../common/forms/helpers';
import type { FormDefinition, LayoutDefinition } from '../common/forms/types';
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
