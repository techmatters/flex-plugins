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
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { InformationIcon } from '@twilio-paste/icons/cjs/InformationIcon';
import { SideLink, SideNavChildrenProps } from '@twilio/flex-ui';
import { HelplineEntry } from 'hrm-form-definitions';

import CounselorToolkitDialog from './CounselorToolkitDialog';
import { getDefinitionVersions } from '../../HrmFormPlugin';

type Props = SideNavChildrenProps & {
  showLabel: boolean;
};

const CounselorToolkitSideLink: React.FC<Props> = ({ showLabel }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const { currentDefinitionVersion } = getDefinitionVersions();

  const handleCloseDialog = () => {
    setAnchorEl(null);
  };

  const handleOpenConnectDialog = e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const { helplineInformation } = currentDefinitionVersion;
  const helpline = helplineInformation.helplines.find((data: HelplineEntry) => data.default);
  const helplineName = helpline.label;
  const toolkitUrl = helpline?.kmsUrl;

  return (
    <>
      {toolkitUrl && (
        <div
          onClick={e => {
            handleOpenConnectDialog(e);
          }}
        >
          <SideLink
            showLabel={showLabel}
            icon={<InformationIcon decorative={false} title="Counselor Toolkit" />}
            iconActive={<InformationIcon decorative={false} title="Counselor Toolkit" />}
          />
        </div>
      )}
      <CounselorToolkitDialog
        anchorEl={anchorEl}
        handleCloseDialog={handleCloseDialog}
        toolkitUrl={toolkitUrl}
        helplineName={helplineName}
      />
    </>
  );
};

CounselorToolkitSideLink.displayName = 'CounselorToolkitSideLink';

export default CounselorToolkitSideLink;
