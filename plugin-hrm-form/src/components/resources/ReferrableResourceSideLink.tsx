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

/* eslint-disable react/prop-types */
import { DocumentationIcon } from '@twilio-paste/icons/cjs/DocumentationIcon';
import React from 'react';
import { Template, SideLink, SideNavChildrenProps } from '@twilio/flex-ui';

type Props = SideNavChildrenProps & { showLabel: boolean; onClick: () => void };

const ReferrableResourceSideLink: React.FC<Props> = ({ showLabel, activeView, onClick }) => {
  return (
    <SideLink
      showLabel={showLabel}
      icon={<DocumentationIcon decorative={false} title="Resources" />}
      iconActive={<DocumentationIcon decorative={false} title="Resources" />}
      isActive={activeView === 'referrable-resources'}
      onClick={onClick}
    >
      <Template code="ReferrableResource-SideNav" />
    </SideLink>
  );
};

ReferrableResourceSideLink.displayName = 'ReferrableResourceSideLink';

export default ReferrableResourceSideLink;
