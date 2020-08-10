/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { CallerFormValues } from '../common/forms/CallerForm';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import InformationRow from './InformationRow';

type OwnProps = {
  onClickAddPerpetrator: () => void;
  onClickView: () => void;
  perpetrators: CallerFormValues[];
};

const Perpetrators: React.FC<OwnProps> = ({ onClickAddPerpetrator, onClickView, perpetrators }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddPerpetratprSection-label">
            <Template code="Case-AddPerpetratprSection" />
          </CaseSectionFont>
          <CaseAddButton templateCode="Case-AddPerpetrator" onClick={onClickAddPerpetrator} />
        </Row>
      </Box>
      {perpetrators.length ? (
        perpetrators.map((perpetrator, index) => (
          <InformationRow key={`perpetrator-${index}`} person={perpetrator} onClickView={onClickView} />
        ))
      ) : (
        <TimelineRow>
          <PlaceHolderText>
            <Template code="Case-NoPerpetrators" />
          </PlaceHolderText>
        </TimelineRow>
      )}
    </>
  );
};

Perpetrators.displayName = 'Perpetrators';

export default Perpetrators;
