/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Row, HiddenText } from '../../styles/HrmStyles';
import { CaseActionTitle, CaseActionDetailFont } from '../../styles/case';

type OwnProps = {
  titleTemplate: string;
  onClickClose: () => void;
  added?: string;
  counselor: string;
};

type Props = OwnProps;

const ActionHeader: React.FC<Props> = ({ titleTemplate, onClickClose, added, counselor }) => {
  return (
    <>
      <Row style={{ width: '100%' }}>
        <CaseActionTitle style={{ marginTop: 'auto' }}>
          <Template code={titleTemplate} />
        </CaseActionTitle>
        <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }} data-testid="Case-CloseCross">
          <HiddenText>
            <Template code="Case-CloseButton" />
          </HiddenText>
          <Close />
        </ButtonBase>
      </Row>
      <Row style={{ width: '100%' }}>
        <CaseActionDetailFont style={{ marginRight: 20 }}>
          <Template code="Case-ActionHeaderAdded" /> {added || new Date().toLocaleDateString(navigator.language)}
        </CaseActionDetailFont>
        <CaseActionDetailFont style={{ marginRight: 20 }}>
          <Template code="Case-ActionHeaderCounselor" /> {counselor}
        </CaseActionDetailFont>
      </Row>
    </>
  );
};

ActionHeader.displayName = 'ActionHeader';

export default ActionHeader;
