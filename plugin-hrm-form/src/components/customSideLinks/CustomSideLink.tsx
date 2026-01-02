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
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { InformationIcon } from '@twilio-paste/icons/cjs/InformationIcon';
import MapIcon from '@material-ui/icons/Map';
import { SideLink, SideNavChildrenProps, Manager, Template } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';
import * as Flex from '@twilio/flex-ui';

import CustomSideLinkConfirmDialog from './CustomSideLinkConfirmDialog';
import { selectCurrentDefinitionVersion } from '../../states/configuration/selectDefinitions';

const lookupLabel = (key: string) => Manager.getInstance().strings[key] ?? key;

const ICON_MAP: Record<
  string,
  { active: (labelKey: string) => JSX.Element; inactive: (labelKey: string) => JSX.Element }
> = {
  info: {
    active: labelKey => <InformationIcon decorative={false} title={lookupLabel(labelKey)} />,
    inactive: labelKey => <InformationIcon decorative={false} title={lookupLabel(labelKey)} />,
  },
  map: {
    active: labelKey => <MapIcon aria-label={lookupLabel(labelKey)} titleAccess={lookupLabel(labelKey)} />,
    inactive: labelKey => <MapIcon aria-label={lookupLabel(labelKey)} titleAccess={lookupLabel(labelKey)} />,
  },
};

type Props = SideNavChildrenProps & {
  showLabel: boolean;
  url: string;
  linkType: DefinitionVersion['customLinks'][number]['type'];
  iconKey: string;
  labelKey: string;
};

const CustomSideLink: React.FC<Props> = ({ showLabel, url, linkType, iconKey, labelKey }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const definitionVersion = useSelector(selectCurrentDefinitionVersion);
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

  return (
    <>
      <div
        onClick={e => {
          if (linkType === 'new-window') {
            handleOpenConnectDialog(e);
          } else {
            Flex.Actions.invokeAction('NavigateToView', { viewName: `custom-link`, subroute: url });
          }
        }}
      >
        <SideLink
          showLabel={showLabel}
          icon={ICON_MAP[iconKey].inactive(labelKey)}
          iconActive={ICON_MAP[iconKey].active(labelKey)}
        >
          <Template code={labelKey} />
        </SideLink>
      </div>
      {linkType === 'new-window' && (
        <CustomSideLinkConfirmDialog anchorEl={anchorEl} handleCloseDialog={handleCloseDialog} url={url} />
      )}
    </>
  );
};

CustomSideLink.displayName = 'CounselorToolkitSideLink';

export default CustomSideLink;
