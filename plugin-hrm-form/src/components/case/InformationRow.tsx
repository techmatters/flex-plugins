/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { CallerFormValues } from '../common/forms/CallerForm';
import { TimelineRow, InformationBoldText, TimelineText, ViewButton } from '../../styles/case';
import { Box, Row, HiddenText } from '../../styles/HrmStyles';
import { formatName } from '../../utils';

type OwnProps = {
  person: CallerFormValues;
  onClickView: () => void;
};

const RowItem: React.FC<{ isName?: boolean }> = ({ children, isName }) => (
  /*
   * <Grid item xs role="gridcell" tabIndex={-1} style={{ alignItems: 'center', justifyContent: 'center' }}>
   *   {children}
   * </Grid>
   */
  <Row style={{ flex: isName ? 1.5 : 1 }}>{children}</Row>
);
RowItem.displayName = 'RowItem';

const InformationRow: React.FC<OwnProps> = ({ person, onClickView }) => {
  return (
    <TimelineRow>
      <RowItem isName>
        <HiddenText>
          <Template code="Case-PerpetratorName" />
        </HiddenText>
        <InformationBoldText>{formatName(`${person.name.firstName} ${person.name.lastName}`)}</InformationBoldText>
      </RowItem>
      <RowItem>
        <HiddenText>
          <Template code="Case-PerpetratorGender" />
        </HiddenText>
        <TimelineText>{person.gender}</TimelineText>
      </RowItem>
      <RowItem>
        <HiddenText>
          <Template code="Case-PerpetratorAge" />
        </HiddenText>
        <TimelineText>{person.age}</TimelineText>
      </RowItem>
      <RowItem>
        <HiddenText>
          <Template code="Case-PerpetratorRelationship" />
        </HiddenText>
        <TimelineText>{person.relationshipToChild}</TimelineText>
      </RowItem>
      <RowItem>
        <Box marginLeft="auto" marginRight="10px">
          <ViewButton onClick={onClickView}>
            <Template code="Case-ViewButton" />
          </ViewButton>
        </Box>
      </RowItem>
    </TimelineRow>
  );
};

InformationRow.displayName = 'InformationRow';

export default InformationRow;
