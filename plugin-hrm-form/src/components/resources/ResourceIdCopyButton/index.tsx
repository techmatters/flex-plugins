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

import * as React from 'react';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';
import CheckIcon from '@material-ui/icons/CheckCircle';
import { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';

import { Button } from './styles';
import { getTemplateStrings } from '../../../hrmConfig';

type OwnProps = {
  resourceId: string;
  height?: string;
};

const ResourceIdCopyButton: React.FC<OwnProps> = ({ resourceId, height = '36px' }) => {
  const strings = getTemplateStrings();
  const [justCopied, setJustCopied] = useState(false);
  let copiedStateTimerId: NodeJS.Timeout;

  const copyClicked = async () => {
    await navigator.clipboard.writeText(resourceId);
    setJustCopied(true);
    copiedStateTimerId = setTimeout(() => {
      setJustCopied(false);
      copiedStateTimerId = undefined;
    }, 2000);
  };

  useEffect(
    () => () => {
      if (copiedStateTimerId) {
        clearTimeout(copiedStateTimerId);
      }
    },
    [copiedStateTimerId],
  );

  return justCopied ? (
    <Button type="button" title={`${strings['Resources-IdCopied']} #${resourceId}`} style={{ height }}>
      <CheckIcon style={{ marginRight: '8px' }} />
      &nbsp;
      <Template code="Resources-IdCopied" />
    </Button>
  ) : (
    <Button
      type="button"
      onClick={copyClicked}
      title={`${strings['Resources-CopyId']} #${resourceId}`}
      style={{ height }}
      data-testid="copy-id-button"
    >
      <CopyIcon style={{ marginRight: '8px' }} />
      &nbsp;
      <Template code="Resources-CopyId" />
    </Button>
  );
};

ResourceIdCopyButton.displayName = 'ResourceIdCopyButton';

export default ResourceIdCopyButton;
