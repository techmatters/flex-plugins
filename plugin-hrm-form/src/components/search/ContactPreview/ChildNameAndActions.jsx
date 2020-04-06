import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Fullscreen, Link, MoreHoriz } from '@material-ui/icons';

import { Row } from '../../../Styles/HrmStyles';
import { PrevNameText, ContactButtonsWrapper, StyledIcon } from '../../../Styles/search';

const LinkIcon = StyledIcon(Link);
const FullscreenIcon = StyledIcon(Fullscreen);
const MoreHorizIcon = StyledIcon(MoreHoriz);

const ChildNameAndActions = ({ name, onClickChain, onClickFull, onClickMore }) => (
  <Row>
    <PrevNameText>{name}</PrevNameText>
    <ContactButtonsWrapper>
      <IconButton onClick={onClickChain}>
        <LinkIcon />
      </IconButton>
      <IconButton onClick={onClickFull}>
        <FullscreenIcon />
      </IconButton>
      <IconButton onClick={onClickMore}>
        <MoreHorizIcon />
      </IconButton>
    </ContactButtonsWrapper>
  </Row>
);

ChildNameAndActions.propTypes = {
  name: PropTypes.string.isRequired,
  onClickChain: PropTypes.func.isRequired,
  onClickFull: PropTypes.func.isRequired,
  onClickMore: PropTypes.func.isRequired,
};

ChildNameAndActions.displayName = 'ChildNameAndActions';

export default ChildNameAndActions;
