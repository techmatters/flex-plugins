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

import { CheckCircleOutlineOutlined, CreateNewFolderOutlined } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';
import React from 'react';

import { PreviewActionButton } from '../search/styles';
import { getTemplateStrings } from '../../hrmConfig';
import type { Case } from '../../types/types';

type OwnProps = {
  isConnectedToTaskContact: boolean;
  onClickConnectToTaskContact: () => void;
  caseId: Case['id'];
  color?: 'black' | 'grey';
};

type Props = OwnProps;

const ConnectToCaseButton: React.FC<Props> = ({
  isConnectedToTaskContact,
  onClickConnectToTaskContact,
  color = 'grey',
  caseId,
}) => {
  const strings = getTemplateStrings();
  return (
    <PreviewActionButton
      style={{ height: '28px' }}
      disabled={isConnectedToTaskContact}
      onClick={onClickConnectToTaskContact}
      data-fs-id="AddToCase-Button"
      secondary={color === 'grey' ? 'true' : 'false'}
      title={`${strings['CaseHeader-ConnectToTaskContact']} #${caseId}`}
    >
      {!isConnectedToTaskContact && <CreateNewFolderOutlined />}
      {isConnectedToTaskContact && <CheckCircleOutlineOutlined />}
      <div style={{ width: 10 }} />
      <Template
        code={isConnectedToTaskContact ? 'CaseHeader-TaskContactConnected' : 'CaseHeader-ConnectToTaskContact'}
      />
    </PreviewActionButton>
  );
};

ConnectToCaseButton.displayName = 'ConnectToCaseButton';

export default ConnectToCaseButton;
