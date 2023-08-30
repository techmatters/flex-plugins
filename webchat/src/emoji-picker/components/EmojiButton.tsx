/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/require-default-props */
import * as React from 'react';
import { connect } from 'react-redux';

import { toggleEmojiPicker } from '../emoji-state';
import { EmojiRow, EmojiButtonStyled } from './emoji-styles';
import EmojiIcon from './EmojiIcon';

type Props = typeof mapDispatchToProps;

const EmojiButton = ({ onToggleEmojiPicker }: Props) => {
  return (
    <EmojiRow>
      <EmojiButtonStyled type="button" onClick={onToggleEmojiPicker}>
        <EmojiIcon />
      </EmojiButtonStyled>
    </EmojiRow>
  );
};

const mapDispatchToProps = {
  onToggleEmojiPicker: toggleEmojiPicker,
};

export default connect(null, mapDispatchToProps)(EmojiButton);
