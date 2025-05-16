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
import { connect, ConnectedProps } from 'react-redux';
import { InformationIcon } from '@twilio-paste/icons/cjs/InformationIcon';
import { SideLink, SideNavChildrenProps } from '@twilio/flex-ui';
import { HelplineEntry } from '@tech-matters/hrm-form-definitions';

import CounselorToolkitDialog from './CounselorToolkitDialog';
import { RootState } from '../../states';
import { configurationBase, namespace } from '../../states/storeNamespaces';

const mapStateToProps = (state: RootState) => ({
  definitionVersion: state[namespace][configurationBase].currentDefinitionVersion,
});

const connector = connect(mapStateToProps);

type Props = SideNavChildrenProps &
  ConnectedProps<typeof connector> & {
    showLabel: boolean;
  };

const CounselorToolkitSideLink: React.FC<Props> = ({ showLabel, definitionVersion }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!definitionVersion) {
    return null;
  }

  const handleCloseDialog = () => {
    setAnchorEl(null);
  };

  const handleOpenConnectDialog = e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const { helplineInformation } = definitionVersion;
  const helpline = helplineInformation.helplines.find((data: HelplineEntry) => data.default);
  const helplineName = helpline.label;
  const toolkitUrl = helpline?.kmsUrl;

  if (!toolkitUrl) return null;

  return (
    <>
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

export default connector(CounselorToolkitSideLink);
