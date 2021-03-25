/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { CaseInfo, HouseholdEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import InformationRow from './InformationRow';
import { PermissionActions, PermissionActionType } from '../../permissions';

type OwnProps = {
  onClickAddHousehold: () => void;
  onClickView: (household: HouseholdEntry) => void;
  households: CaseInfo['households'];
  can: (action: PermissionActionType) => boolean;
};

const Households: React.FC<OwnProps> = ({ onClickAddHousehold, onClickView, households, can }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddHouseholdSection-label">
            <Template code="Case-AddHouseholdSection" />
          </CaseSectionFont>
          <CaseAddButton
            templateCode="Case-Household"
            onClick={onClickAddHousehold}
            disabled={!can(PermissionActions.ADD_HOUSEHOLD)}
          />
        </Row>
      </Box>
      {households.length ? (
        households.map((h, index) => (
          <InformationRow key={`household-${index}`} person={h.household} onClickView={() => onClickView(h)} />
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
