/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { Button } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Link from '@material-ui/icons/Link';
import CropFreeIcon from '@material-ui/icons/CropFree';
import CallMergeIcon from '@material-ui/icons/CallMerge';

import { Menu, MenuItem } from '../../menu';
import { CaseHeaderContainer, CaseHeaderCaseId, CaseHeaderChildName, DateText } from '../../../styles/search';

type OwnProps = {
  caseId: number;
  childName?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Props = OwnProps;

const CaseHeader: React.FC<Props> = ({ caseId, childName, createdAt, updatedAt }) => {
  const createdAtFormatted = `${format(new Date(createdAt), 'MMM d, yyyy')}`;
  const updatedAtFormatted = `${format(new Date(updatedAt), 'MMM d, yyyy')}`;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { firstName, lastName } = childName || {};
  return (
    <CaseHeaderContainer>
      <CaseHeaderCaseId>#{caseId}</CaseHeaderCaseId>
      <CaseHeaderChildName>{childName ? `${firstName} ${lastName}` : 'No Data'}</CaseHeaderChildName>
      <DateText>
        <Template code="CaseHeader-Opened" />: {createdAtFormatted}
      </DateText>
      <DateText>
        <Template code="CaseHeader-Updated" />: {updatedAtFormatted}
      </DateText>
      <Button onClick={handleClick}>
        <DateText>
          <MoreHorizIcon />
        </DateText>
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClickAway={handleClose}>
        <MenuItem Icon={CropFreeIcon} text={<Template code="CaseHeader-ViewCase" />} onClick={handleClose} />
        <MenuItem
          Icon={CallMergeIcon}
          text={<Template code="CaseHeader-MergeContactIntoCase" />}
          onClick={handleClose}
        />
        <MenuItem Icon={Link} text={<Template code="CaseHeader-CopyChildInfo" />} onClick={handleClose} />
      </Menu>
    </CaseHeaderContainer>
  );
};

CaseHeader.displayName = 'CaseHeader';

export default CaseHeader;
