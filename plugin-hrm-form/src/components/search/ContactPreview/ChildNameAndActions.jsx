import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Fullscreen, Link, MoreHoriz } from '@material-ui/icons';

import { Row, StyledIcon, HiddenText, addHover } from '../../../styles/HrmStyles';
import { PrevNameText, ContactButtonsWrapper, StyledButtonBase } from '../../../styles/search';

const LinkIcon = addHover(StyledIcon(Link));
const FullscreenIcon = addHover(StyledIcon(Fullscreen));
const MoreHorizIcon = addHover(StyledIcon(MoreHoriz));

const ChildNameAndActions = ({ name, isNonDataContact, onClickChain, onClickFull, onClickMore }) => (
  <Row>
    <PrevNameText>{name}</PrevNameText>
    <ContactButtonsWrapper>
      <StyledButtonBase onClick={onClickChain} disabled={isNonDataContact}>
        <HiddenText>
          <Template code="ContactPreview-CopyButton" />
        </HiddenText>
        <LinkIcon />
      </StyledButtonBase>
      <StyledButtonBase onClick={onClickFull}>
        <HiddenText>
          <Template code="ContactPreview-ExpandButton" />
        </HiddenText>
        <FullscreenIcon />
      </StyledButtonBase>
      <StyledButtonBase onClick={onClickMore}>
        <HiddenText>
          <Template code="ContactPreview-MoreOptionsButton" />
        </HiddenText>
        <MoreHorizIcon />
      </StyledButtonBase>
    </ContactButtonsWrapper>
  </Row>
);

ChildNameAndActions.propTypes = {
  name: PropTypes.string.isRequired,
  isNonDataContact: PropTypes.bool.isRequired,
  onClickChain: PropTypes.func.isRequired,
  onClickFull: PropTypes.func.isRequired,
  onClickMore: PropTypes.func.isRequired,
};

ChildNameAndActions.displayName = 'ChildNameAndActions';

export default ChildNameAndActions;
