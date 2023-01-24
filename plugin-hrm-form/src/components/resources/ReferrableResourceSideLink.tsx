/* eslint-disable react/prop-types */
import React from 'react';
import { Template, SideLink, SideNavChildrenProps } from '@twilio/flex-ui';
import SearchIcon from '@material-ui/icons/Description';

type Props = SideNavChildrenProps & { showLabel: boolean; onClick: () => void };

const ReferrableResourceSideLink: React.FC<Props> = ({ showLabel, activeView, onClick }) => {
  return (
    <SideLink
      showLabel={showLabel}
      icon={<SearchIcon />}
      iconActive={<SearchIcon />}
      isActive={activeView === 'referrable-resources'}
      onClick={onClick}
    >
      <Template code="ReferrableResource-SideNav" />
    </SideLink>
  );
};

ReferrableResourceSideLink.displayName = 'ReferrableResourceSideLink';

export default ReferrableResourceSideLink;
