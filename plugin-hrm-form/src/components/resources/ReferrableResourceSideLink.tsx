/* eslint-disable react/prop-types */
import { DocumentationIcon } from "@twilio-paste/icons/esm/DocumentationIcon";
import React from 'react';
import { Template, SideLink, SideNavChildrenProps } from '@twilio/flex-ui';

type Props = SideNavChildrenProps & { showLabel: boolean; onClick: () => void };

const ReferrableResourceSideLink: React.FC<Props> = ({ showLabel, activeView, onClick }) => {
  return (
    <SideLink
      showLabel={showLabel}
      icon={<DocumentationIcon  decorative={false} title="Resources" />}
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
