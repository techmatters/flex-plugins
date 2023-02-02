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
  const toolkitUrl = helpline.kmsUrl;

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

export default CounselorToolkitSideLink;
