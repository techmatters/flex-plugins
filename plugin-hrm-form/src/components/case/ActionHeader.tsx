/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Close } from '@material-ui/icons';

import { Row, HiddenText, HeaderCloseButton } from '../../styles/HrmStyles';
import { CaseActionTitle, CaseActionDetailFont } from '../../styles/case';

type OwnProps = {
  titleTemplate: string;
  onClickClose: () => void;
  added?: Date;
  addingCounsellor: string;
  updated?: Date;
  updatingCounsellor?: string;
  includeTime?: boolean;
};

type Props = OwnProps;

const ActionHeader: React.FC<Props> = ({
  titleTemplate,
  onClickClose,
  added,
  addingCounsellor,
  updated,
  updatingCounsellor,
}) => {
  // @ts-ignore
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
        {added && (
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderAdded">
            <Template
              code="Case-ActionHeaderAdded"
              date={added.toLocaleDateString()}
              time={added.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })}
              counsellor={addingCounsellor}
            />
          </CaseActionDetailFont>
        )}
        {!added && (
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderCounselor">
            <Template code="Case-ActionHeaderCounselor" /> {addingCounsellor}
          </CaseActionDetailFont>
        )}
      </Row>
      {updated && (
        <Row style={{ width: '100%' }}>
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderUpdated">
            <Template
              code="Case-ActionHeaderUpdated"
              date={updated.toLocaleDateString()}
              time={updated.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })}
              counsellor={updatingCounsellor}
            />
          </CaseActionDetailFont>
        </Row>
      )}
    </>
  );
};

ActionHeader.displayName = 'ActionHeader';

export default ActionHeader;
