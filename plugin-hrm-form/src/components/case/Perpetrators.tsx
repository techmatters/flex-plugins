/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { CaseInfo, PerpetratorEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import InformationRow from './InformationRow';

type OwnProps = {
  onClickAddPerpetrator: () => void;
  onClickView: (perpetrator: PerpetratorEntry) => void;
  perpetrators: CaseInfo['perpetrators'];
  status: string;
};

const Perpetrators: React.FC<OwnProps> = ({ onClickAddPerpetrator, onClickView, perpetrators, status }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddPerpetratorSection-label">
            <Template code="Case-AddPerpetratorSection" />
          </CaseSectionFont>
          <CaseAddButton templateCode="Case-Perpetrator" onClick={onClickAddPerpetrator} status={status} />
        </Row>
      </Box>
      {perpetrators.length ? (
        perpetrators.map((p, index) => (
          <InformationRow key={`perpetrator-${index}`} person={p.perpetrator} onClickView={() => onClickView(p)} />
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
