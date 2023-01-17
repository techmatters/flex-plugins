/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Close } from '@material-ui/icons';
import { isEqual } from 'date-fns';

import { Row, HiddenText, HeaderCloseButton } from '../../styles/HrmStyles';
import { CaseActionTitle, CaseActionDetailFont } from '../../styles/case';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  titleTemplate: string;
  onClickClose: () => void;
  added?: Date;
  addingCounsellor: string;
  updated?: Date;
  updatingCounsellor?: string;
  includeTime?: boolean;
  codeTemplate?: string;
  focusCloseButton?: boolean;
};

type Props = OwnProps;

const ActionHeader: React.FC<Props> = ({
  titleTemplate,
  onClickClose,
  added,
  addingCounsellor,
  updated,
  updatingCounsellor,
  codeTemplate,
  focusCloseButton,
}) => {
  const focusElementRef = useFocus();

  return (
    <>
      <Row style={{ width: '100%' }}>
        <CaseActionTitle style={{ marginTop: 'auto' }}>
          <Template code={titleTemplate} />
        </CaseActionTitle>
        <HeaderCloseButton
          onClick={onClickClose}
          data-testid="Case-CloseCross"
          ref={ref => {
            if (focusCloseButton) {
              focusElementRef.current = ref;
            }
          }}
        >
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
              code={codeTemplate ? codeTemplate : 'Case-ActionHeaderAdded'}
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
      {updated && !isEqual(updated, added) && (
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
