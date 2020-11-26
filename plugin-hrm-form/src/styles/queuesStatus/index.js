import styled from 'react-emotion';

import { FontOpenSans } from '../HrmStyles';

export const Container = styled('div')`
  display: flex;
  flex-grow: 0;
  flex-direction: column;
  background-color: ${props => (props.backgroundColor ? props.backgroundColor : '#ffffff')};
  border-style: solid;
`;

export const QueuesContainer = styled('div')`
  width: 100%;
  ${props => props.paddingRight && 'padding-right: 30px;'}
`;

export const QueueName = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 400;
  line-height: 14px;
  padding-left: 2px;
`;

export const ChannelColumn = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${props => props.marginLeft && 'margin-left: 3px;'}
`;

export const ChannelBox = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 26px;
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
  margin-bottom: 5px;
  color: ${props => (props.isZero ? '#646D7F' : '#000000')};
  background-color: ${props => `${props.backgroundColor}26` /* adds 0.15 opacity alpha to the hex string */};
`;

export const ChannelLabel = styled(FontOpenSans)`
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
`;

const WaitTimeText = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
`;

export const WaitTimeLabel = styled(WaitTimeText)`
  opacity: 0.46;
  margin-right: 1em;
`;

export const WaitTimeValue = styled(WaitTimeText)`
  color: #192b33;
`;
