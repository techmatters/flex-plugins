import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Typography } from '@material-ui/core';
import { Fullscreen as FullscreenIcon, Link as LinkIcon, MoreHoriz as MoreHorizIcon } from '@material-ui/icons';

import { StyledRow, ContactButtonsWrapper } from '../../../Styles/search';

const CardRow1 = ({ name, onClickChain }) => (
  <StyledRow>
    <Typography variant="subtitle1">{name}</Typography>
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
