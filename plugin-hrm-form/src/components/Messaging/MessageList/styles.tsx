import { styled } from '@twilio/flex-ui';

import { FontOpenSans } from '../../../styles/HrmStyles';

export const MessageListContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6px 0;
  width: 100%;
`;
MessageListContainer.displayName = 'MessageListContainer';

export const DateRulerContainer = styled('div')`
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%;
`;
DateRulerContainer.displayName = 'DateRulerContainer';

export const DateRulerHr = styled('hr')`
  flex: 1 1 1px;
  margin: auto;
  border-color: rgb(198, 202, 215);
`;
DateRulerHr.displayName = 'DateRulerHr';

export const DateRulerDateText = styled(FontOpenSans)`
  flex: 0 1 auto;
  margin-left: 12px;
  margin-right: 12px;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgb(34, 34, 34);
`;
DateRulerDateText.displayName = 'DateRulerDateText';
