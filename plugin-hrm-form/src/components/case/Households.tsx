/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { CaseInfo } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import InformationRow from './InformationRow';

type OwnProps = {
  onClickAddHousehold: () => void;
  onClickView: () => void;
  households: CaseInfo['households'];
};

const Households: React.FC<OwnProps> = ({ onClickAddHousehold, onClickView, households }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddHouseholdSection-label">
            <Template code="Case-AddHouseholdSection" />
          </CaseSectionFont>
          <CaseAddButton templateCode="Case-AddHousehold" onClick={onClickAddHousehold} />
        </Row>
      </Box>
      {households.length ? (
        households.map((h, index) => (
          <InformationRow key={`household-${index}`} person={h.household} onClickView={onClickView} />
        ))
      ) : (
        <TimelineRow>
          <PlaceHolderText>
            <Template code="Case-NoHouseholds" />
          </PlaceHolderText>
        </TimelineRow>
      )}
    </>
  );
};

Households.displayName = 'Households';

export default Households;
