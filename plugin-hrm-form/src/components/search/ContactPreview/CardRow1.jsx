import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Fullscreen, Link, MoreHoriz } from '@material-ui/icons';

import { NameFont, RowWithMargin, ContactButtonsWrapper, StyledIcon } from '../../../Styles/search';

const StyledRow = RowWithMargin(0);

const LinkIcon = StyledIcon(Link);
const FullscreenIcon = StyledIcon(Fullscreen);
const MoreHorizIcon = StyledIcon(MoreHoriz);

const CardRow1 = ({ name, onClickChain }) => (
  <StyledRow>
    <NameFont>{name}</NameFont>
    <ContactButtonsWrapper>
      <IconButton onClick={onClickChain}>
        <LinkIcon />
      </IconButton>
      <IconButton>
        <FullscreenIcon />
      </IconButton>
      <IconButton>
        <MoreHorizIcon />
      </IconButton>
    </ContactButtonsWrapper>
  </StyledRow>
);

CardRow1.propTypes = {
  name: PropTypes.string.isRequired,
  onClickChain: PropTypes.func.isRequired,
};

CardRow1.displayName = 'CardRow1';

export default CardRow1;
