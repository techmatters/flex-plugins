/* eslint-disable react/prop-types */
import React, { ReactNode } from 'react';
import { Template } from '@twilio/flex-ui';

import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import { PermissionActions, PermissionActionType } from '../../permissions';

type OwnProps = {
  onClickAddItem: () => void;
  canAdd: () => boolean;
  sectionTypeId: string;
  children?: JSX.Element;
};

const CaseSection: React.FC<OwnProps> = ({ onClickAddItem, canAdd, children, sectionTypeId }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id={`Case-Add${sectionTypeId}Section-label`}>
            <Template code={`Case-Add${sectionTypeId}Section`} />
          </CaseSectionFont>
          <CaseAddButton templateCode={`Case-${sectionTypeId}`} onClick={onClickAddItem} disabled={!canAdd()} />
        </Row>
      </Box>

      {!children || children.type === null ? (
        <TimelineRow>
          <PlaceHolderText>
            <Template code={`Case-No${sectionTypeId}s`} />
          </PlaceHolderText>
        </TimelineRow>
      ) : (
        children
      )}
    </>
  );
};

CaseSection.displayName = `CaseSection`;

export default CaseSection;
