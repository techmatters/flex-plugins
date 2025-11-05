/**
 * Copyright (C) 2021-2025 Technology Matters
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

import React, { CSSProperties } from 'react';
import { Manager, styled, Template } from '@twilio/flex-ui';

import { FontOpenSans } from './styles';

const LabelText = styled(FontOpenSans)`
  font-size: 0.875rem;
  line-height: 1.25rem;
  vertical-align: baseline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LabelContainer = styled('div')`
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-flex: 0;
  flex-grow: 0;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  display: flex;
`;

type Props = TaskContextProps & { renderIfTranslationSameAsUntranslated?: boolean; style?: CSSProperties };

const QueueNameLabel: React.FC<Props> = ({ task, renderIfTranslationSameAsUntranslated = true, style }) => {
  const { strings } = Manager.getInstance();
  if (
    !renderIfTranslationSameAsUntranslated &&
    (!strings[task.queueName] || task.queueName === strings[task.queueName])
  ) {
    return null;
  }
  return (
    <LabelContainer style={style}>
      <LabelText>
        <Template code="QueueCard-Name" />{' '}
      </LabelText>
      <LabelText style={{ fontWeight: 700 }}>
        <Template code={task.queueName} />
      </LabelText>
    </LabelContainer>
  );
};
QueueNameLabel.displayName = 'QueueNameLabel';

export default QueueNameLabel;
