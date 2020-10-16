/* eslint-disable react/prop-types */
import React from 'react';
import { Template, SideLink, SideNavChildrenProps } from '@twilio/flex-ui';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import FolderIcon from '@material-ui/icons/Folder';

type Props = SideNavChildrenProps & { showLabel: boolean; onClick: () => void };

const CaseListSideLink: React.FC<Props> = ({ showLabel, activeView, onClick }) => {
  return (
    <SideLink
      showLabel={showLabel}
      icon={<FolderOpenIcon />}
      iconActive={<FolderIcon />}
      isActive={activeView === 'case-list'}
      onClick={onClick}
    >
      <Template code="SideNavCaseList" />
    </SideLink>
  );
};

CaseListSideLink.displayName = 'CaseListSideLink';

export default CaseListSideLink;
