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

import React from 'react';

type Props = {
  width: string;
  height: string;
};

/* eslint-disable react/prop-types */
const VideoIcon: React.FC<Props> = ({ width, height }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24">
      <path
        d="M13.969 7.284H5.03c-.01 0-.018.006-.023.016A.07.07 0 005 7.331v8.938c0 .01.003.02.008.031.005.01.013.016.023.016h8.938c.01 0 .018-.006.023-.016a.07.07 0 00.008-.031v-1.953c0-.188.05-.362.148-.524a.966.966 0 01.399-.367.752.752 0 01.226-.086 1.155 1.155 0 01.532.016c.099.026.19.07.273.133L19 15.363V8.222l-3.406 1.922a.778.778 0 01-.281.133c-.105.026-.209.039-.313.039-.073 0-.148-.008-.227-.024a.968.968 0 01-.242-.086.994.994 0 01-.383-.367.984.984 0 01-.148-.523V7.33a.07.07 0 00-.008-.031c-.005-.01-.013-.016-.023-.016zm5.5-.5c.062 0 .112.008.148.024.037.015.06.023.07.023a.511.511 0 01.313.484V16.3a.485.485 0 01-.086.281.531.531 0 01-.227.188.254.254 0 00-.07.023.337.337 0 01-.133.024c-.062 0-.125-.003-.187-.008a.308.308 0 01-.188-.102L15 14.316v1.953c0 .291-.102.539-.305.742a.992.992 0 01-.726.305H5.03a.992.992 0 01-.726-.305A1.01 1.01 0 014 16.269V7.33c0-.291.102-.539.305-.742a.992.992 0 01.726-.305h8.938c.291 0 .536.102.734.305.198.203.297.45.297.742v1.985l4.031-2.375a.464.464 0 01.227-.125.977.977 0 01.21-.032z"
        fill="currentColor"
        fillRule="nonzero"
        stroke="none"
        strokeWidth="1"
      />
    </svg>
  );
};

VideoIcon.displayName = 'VideoIcon';
export default VideoIcon;
