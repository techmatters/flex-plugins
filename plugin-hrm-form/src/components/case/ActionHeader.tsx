/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Close } from '@material-ui/icons';

import { Row, HiddenText, HeaderCloseButton } from '../../styles/HrmStyles';
import { CaseActionTitle, CaseActionDetailFont } from '../../styles/case';
import { formatDateTime } from '../../utils/formatters';

type OwnProps = {
  titleTemplate: string;
  onClickClose: () => void;
  added?: Date;
  counselor: string;
};

type Props = OwnProps;

const ActionHeader: React.FC<Props> = ({ titleTemplate, onClickClose, added, counselor }) => {
  const dateString = formatDateTime(added || new Date());

  return (
    <>
      <Row style={{ width: '100%' }}>
        <CaseActionTitle style={{ marginTop: 'auto' }}>
          <Template code={titleTemplate} />
        </CaseActionTitle>
        <HeaderCloseButton onClick={onClickClose} data-testid="Case-CloseCross">
          <HiddenText>
            <Template code="Case-CloseButton" />
          </HiddenText>
          <Close />
        </HeaderCloseButton>
      </Row>
      <Row style={{ width: '100%' }}>
        <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderAdded">
          <Template code="Case-ActionHeaderAdded" /> {dateString}
        </CaseActionDetailFont>
        <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderCounselor">
          <Template code="Case-ActionHeaderCounselor" /> {counselor}
        </CaseActionDetailFont>
      </Row>
    </>
  );
};

ActionHeader.displayName = 'ActionHeader';

export default ActionHeader;
