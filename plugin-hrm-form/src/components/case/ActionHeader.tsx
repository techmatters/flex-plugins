/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Close } from '@material-ui/icons';

import { Row, HiddenText } from '../../styles/HrmStyles';
import { CaseActionTitle, CaseActionDetailFont, CaseActionCloseButton } from '../../styles/case';
import { formatDateTime } from '../../utils/formatters';

type OwnProps = {
  titleTemplate: string;
  onClickClose: () => void;
  added?: Date;
  counselor: string;
  includeTime?: boolean;
};

type Props = OwnProps;

const ActionHeader: React.FC<Props> = ({ titleTemplate, onClickClose, added, counselor, includeTime = true }) => {
  const dateString = formatDateTime(added || new Date(), includeTime);

  return (
    <>
      <Row style={{ width: '100%' }}>
        <CaseActionTitle style={{ marginTop: 'auto' }}>
          <Template code={titleTemplate} />
        </CaseActionTitle>
        <CaseActionCloseButton onClick={onClickClose} data-testid="Case-CloseCross">
          <HiddenText>
            <Template code="Case-CloseButton" />
          </HiddenText>
          <Close />
        </CaseActionCloseButton>
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
