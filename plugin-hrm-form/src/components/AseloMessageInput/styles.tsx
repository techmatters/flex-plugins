/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';
import { Button, styled } from '@twilio/flex-ui';

const FlexRowNoWrap = styled('div')`
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
`;
FlexRowNoWrap.displayName = 'FlexRowNoWrap';

export const AseloMessageInputContainer = styled(FlexRowNoWrap)`
  flex-direction: column;
  overflow-x: visible;
`;
AseloMessageInputContainer.displayName = 'AseloMessageInputContainer';

export const TextAreaContainer = styled(FlexRowNoWrap)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: flex-end;
  background: rgb(255, 255, 255);
  border: 1.2px solid rgba(202, 205, 216, 1);
  border-radius: 4px;
`;
TextAreaContainer.displayName = 'TextAreaContainer';

export const TextAreaContainerInner = styled('div')`
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border-radius: 4px;

  &:focus-within {
    border: 1px solid rgba(2, 99, 224, 0.7);
    box-shadow: 0px 0px 0px 3px rgba(2, 99, 224, 0.7);
  }
`;
TextAreaContainerInner.displayName = 'TextAreaContainerInner';

type TextAreaProps = {
  paddingVertical: number;
  lineHeight: number;
  height: number;
  minHeight: number;
  maxHeight: number;
  overflow: string;
};
export const TextArea = styled('textarea')<TextAreaProps>`
  display: block;
  box-sizing: border-box;
  overflow: ${({ overflow }) => `${overflow}`};
  width: 100%;
  height: ${({ height }) => `${height}px`};
  min-height: ${({ minHeight }) => `${minHeight}px`};
  max-height: ${({ maxHeight }) => `${maxHeight}px`};
  padding: ${({ paddingVertical }) => `${paddingVertical}px 12px`};
  line-height: ${({ lineHeight }) => `${lineHeight}px`};
  font-size: 0.875rem;
  font-family: 'Inter var experimental', 'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  resize: none;
  outline: none;
  background: transparent;
  color: rgb(18, 28, 45);
  border: 0px;
  border-radius: 4px;
`;
TextArea.displayName = 'TextArea';

export const MessageInputActions = styled(FlexRowNoWrap)`
  overflow: visible;
  margin-bottom: 16px;
`;
MessageInputActions.displayName = 'MessageInputActions';

export const MessageInputActionsInner = styled(MessageInputActions)`
  width: auto;
  margin-bottom: 0;
`;
MessageInputActionsInner.displayName = 'MessageInputActionsInner';

export const ButtonContainer = styled(MessageInputActions)`
  -webkit-box-flex: 0;
  flex-grow: 0;
  margin-bottom: 0;
`;
ButtonContainer.displayName = 'ButtonContainer';

export const SendMessageButton = styled(Button)`
  background: rgba(216, 27, 96, 0.8);
  color: #f6f6f6;
  padding: 4px 8px;
`;
SendMessageButton.displayName = 'SendMessageButton';
