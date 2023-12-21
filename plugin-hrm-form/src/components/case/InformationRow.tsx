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

import { Household, Perpetrator } from '../../types/types';
import { TimelineRow, InformationBoldText, TimelineText, ViewButton, RowItemContainer } from './styles';
import { Box, HiddenText } from '../../styles/HrmStyles';
import { formatName } from '../../utils';

type OwnProps = {
  person: Household | Perpetrator;
  onClickView: () => void;
};

const RowItem: React.FC<{ isName?: boolean }> = ({ children, isName }) => (
  <RowItemContainer style={{ flex: isName ? 1.5 : 1 }}>{children}</RowItemContainer>
);
RowItem.displayName = 'RowItem';

const InformationRow: React.FC<OwnProps> = ({ person, onClickView }) => {
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
        <Box marginLeft="auto">
          <ViewButton onClick={onClickView} data-testid="Case-InformationRow-ViewButton">
            <Template code="Case-ViewButton" />
          </ViewButton>
        </Box>
      </RowItem>
    </TimelineRow>
  );
};

InformationRow.displayName = 'InformationRow';

export default InformationRow;
