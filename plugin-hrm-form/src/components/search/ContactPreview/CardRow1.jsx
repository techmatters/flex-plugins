import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Fullscreen, Link, MoreHoriz } from '@material-ui/icons';

import { NameText, RowWithMargin, ContactButtonsWrapper, StyledIcon } from '../../../Styles/search';

const StyledRow = RowWithMargin(0);

const LinkIcon = StyledIcon(Link);
const FullscreenIcon = StyledIcon(Fullscreen);
const MoreHorizIcon = StyledIcon(MoreHoriz);

const CardRow1 = ({ name, onClickChain, onClickFull, onClickMore }) => (
  <StyledRow>
    <NameText>{name}</NameText>
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
  </StyledRow>
);

CardRow1.propTypes = {
  name: PropTypes.string.isRequired,
  onClickChain: PropTypes.func.isRequired,
  onClickFull: PropTypes.func.isRequired,
  onClickMore: PropTypes.func.isRequired,
};

CardRow1.displayName = 'CardRow1';

export default CardRow1;
