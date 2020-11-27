/* eslint-disable react/prop-types */
import React from 'react';
import { Template, SideLink, SideNavChildrenProps } from '@twilio/flex-ui';
import SearchIcon from '@material-ui/icons/Search';

type Props = SideNavChildrenProps & { showLabel: boolean; onClick: () => void };

const StandaloneSearchSideLink: React.FC<Props> = ({ showLabel, activeView, onClick }) => {
  return (
    <SideLink
      showLabel={showLabel}
      icon={<SearchIcon />}
      iconActive={<SearchIcon />}
      isActive={activeView === 'standalone-search'}
      onClick={onClick}
    >
      <Template code="StandaloneSearch-SideNav" />
    </SideLink>
  );
};

StandaloneSearchSideLink.displayName = 'StandaloneSearchSideLink';

export default StandaloneSearchSideLink;
