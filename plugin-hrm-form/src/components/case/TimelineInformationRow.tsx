/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { TimelineRow, InformationBoldText, TimelineText, ViewButton, RowItemContainer } from '../../styles/case';
import { Box, HiddenText } from '../../styles/HrmStyles';

type OwnProps = {
  values: { label: string; value: string | boolean }[];
  onClickView: () => void;
};

const RowItem: React.FC = ({ children }) => <RowItemContainer style={{ flex: 1 }}>{children}</RowItemContainer>;
RowItem.displayName = 'RowItem';

const TimelineInformationRow: React.FC<OwnProps> = ({ values, onClickView }) => {
  return (
    <TimelineRow>
      {values.map((v, index) => (
        <RowItem key={`item-${v.label}-${index}`}>
          <HiddenText>
            <Template code={v.label} />
          </HiddenText>
          <TimelineText>{v.value}</TimelineText>
          {/* <InformationBoldText>{}</InformationBoldText> */}
        </RowItem>
      ))}
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
