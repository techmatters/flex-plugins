import React from 'react';
import PropTypes from 'prop-types';
import { Template, SideLink } from '@twilio/flex-ui';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import FolderIcon from '@material-ui/icons/Folder';

const CaseListSideLink = props => {
  const { showLabel, activeView, onClick } = props;

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
CaseListSideLink.propTypes = {
  showLabel: PropTypes.bool.isRequired,
  activeView: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CaseListSideLink;
