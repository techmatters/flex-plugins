import { styled } from '@twilio/flex-ui';

import { sectionTitleFontStyle } from '../../styles/search';
import { FontOpenSans, Row } from '../../styles/HrmStyles';

export const ItalicFont = styled(FontOpenSans)`
  font-size: 12px;
  font-style: italic;
  line-height: 17px;
`;
ItalicFont.displayName = 'ItalicFont';

export const LoadTranscriptButton = styled('button')`
  height: 28px;
  width: 30%;
  background-color: ${props => (props.theme.colors as any).secondaryButtonColor};
  border-radius: 4px;
  border-style: none;
`;

export const LoadTranscriptButtonText = styled(FontOpenSans)`
  ${sectionTitleFontStyle}
  text-align: center;
`;
LoadTranscriptButtonText.displayName = 'LoadTranscriptButtonText';

export const MessageList = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6px 0;
  padding: 0 3.75%;
  padding-bottom: 50px;
  width: 100%;
`;
MessageList.displayName = 'MessageList';

export const MessageItemContainer = styled(Row)<{ isCounsellor: boolean; isGroupedWithPrevious: boolean }>`
  flex-wrap: nowrap;
  width: 100%;
  align-items: start;
  padding: 0 15px;
  margin-top: ${({ isGroupedWithPrevious }) => (isGroupedWithPrevious ? '4px' : '20px')};
`;
MessageItemContainer.displayName = 'MessageItemContainer';

type MessageBubbleProps = {
  isCounsellor: boolean;
};
// width: 50%;
export const MessageBubbleContainer = styled(Row)<MessageBubbleProps>`
  border-radius: 4px;
  border-width: 1px;
  padding: 3px;
  overflow: hidden;
  ${p => (p.isCounsellor ? 'margin-left: auto;' : 'margin-right: auto;')}
  ${p => (p.isCounsellor ? 'border-color: blue;' : 'border-color: black;')}
  ${p => (p.isCounsellor ? 'align-items: right;' : 'align-items: left;')}
  background-color: ${props => (props.isCounsellor ? '#057d9e' : props.theme.colors.base2)};
`;
MessageBubbleContainer.displayName = 'MessageBubbleContainer';

export const MessageBubleInnerContainer = styled('div')`
  display: flex;
  flex-flow: column nowrap;
  flex:grow: 1;
  flex-shrink: 1;
  padding: 0 12px 8px 12px;
  `;
MessageBubleInnerContainer.displayName = 'MessageBubleInnerContainer';

export const MessageBubbleHeader = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
MessageBubbleHeader.displayName = 'MessageBubbleHeader';

export const MessageBubbleNameText = styled(FontOpenSans)<{ isCounsellor: boolean }>`
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
  margin-right: 8px;
  color: ${({ isCounsellor }) => (isCounsellor ? '#FFFFFF' : '#222222')};
`;

export const MessageBubbleDateText = styled(FontOpenSans)<{ isCounsellor: boolean }>`
  white-space: nowrap;
  font-size: 10px;
  color: ${({ isCounsellor }) => (isCounsellor ? '#FFFFFF' : '#222222')};
`;
MessageBubbleDateText.displayName = 'MessageBubbleDateText';

export const MessageBubbleBody = styled('div')`
  display: flex;
  margin-top: 3px;
  overflow-wrap: break-word;
  max-width: 440px;
  min-width: 100px;
`;
MessageBubbleBody.displayName = 'MessageBubbleBody';

export const MessageBubbleBodyText = styled(FontOpenSans)<{ isCounsellor: boolean }>`
  font-size: 12px;
  line-height: 1.54;
  overflow-wrap: break-word;
  color: ${({ isCounsellor }) => (isCounsellor ? '#FFFFFF' : '#222222')};
`;
MessageBubbleBodyText.displayName = 'MessageBubbleBodyText';
/*
 * padding-bottom: 8px;
 *   padding-left: 12px;
 *   padding-right: 12px;
 *   margin-top: 3px;
 */

export const AvatarContainer = styled('div')<{ isGroupedWithPrevious: boolean }>`
  margin-right: 12px;
  width: 24px;
  heigth: 24px;
  border-radius: 18px;
  background: ${props => (props.isGroupedWithPrevious ? 'transparent' : props.theme.colors.base2)};
`;
AvatarContainer.displayName = 'AvatarContainer';

/*
 * ${({ isCounsellor }) => isCounsellor && 'padding-: auto;'}
 * ${({ isCounsellor }) => isCounsellor && 'padding-right: auto;'}
 */
