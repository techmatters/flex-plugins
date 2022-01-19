/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { Household, Perpetrator } from '../../types/types';
import {
  TimelineRow,
  InformationBoldText,
  TimelineText,
  ViewButton,
  RowItemContainer,
  EditButton
} from '../../styles/case';
import { Box, HiddenText } from '../../styles/HrmStyles';
import { formatName } from '../../utils';

type OwnProps = {
  person: Household | Perpetrator;
  onClickView: () => void;
  onClickEdit: () => void;
};

const RowItem: React.FC<{ isName?: boolean }> = ({ children, isName }) => (
  <RowItemContainer style={{ flex: isName ? 1.5 : 1 }}>{children}</RowItemContainer>
);
RowItem.displayName = 'RowItem';

const InformationRow: React.FC<OwnProps> = ({ person, onClickView, onClickEdit }) => {
  return (
    <TimelineRow>
      <RowItem isName>
        <HiddenText>
          <Template code="Case-PerpetratorName" />
        </HiddenText>
        <InformationBoldText>{formatName(`${person.firstName} ${person.lastName}`)}</InformationBoldText>
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
          <ViewButton onClick={onClickView} data-testid="Case-InformationRow-ViewButton">
            <Template code="Case-ViewButton" />
          </ViewButton>
          <EditButton onClick={onClickEdit} data-testid="Case-InformationRow-EditButton">
            <Template code="Case-EditButton" />
          </EditButton>
        </Box>
      </RowItem>
    </TimelineRow>
  );
};

InformationRow.displayName = 'InformationRow';

export default InformationRow;
