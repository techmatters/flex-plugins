import { styled } from '@twilio/flex-ui';

import { FontOpenSans } from '../../styles/HrmStyles';

export const ItalicFont = styled(FontOpenSans)`
font-size: 12px;
  font-style: italic;
  line-height: 17px;
`;

export const MessageList = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6px 0;
  width: 100%;
`;
MessageList.displayName = 'MessageList';

type MessageBubbleProps = {
  isFromMe: boolean;
};
export const MessageBubble = styled('div')<MessageBubbleProps>`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin-top: 5px;
  margin-bottom: 5px;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  padding: 3px;
  ${p => (p.isFromMe ? 'margin-left: auto;' : 'margin-right: auto;')}
  ${p => (p.isFromMe ? 'border-color: blue;' : 'border-color: black;')}
  ${p => (p.isFromMe ? 'align-items: right;' : 'align-items: left;')}
`;

export const MessageBubbleHeader = styled('div')`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  font-weight: 600;
`;

export const MessageBubbleBody = styled('div')`
  display: flex;
  font-size: 12px;
  font-weight: 500;
`;
