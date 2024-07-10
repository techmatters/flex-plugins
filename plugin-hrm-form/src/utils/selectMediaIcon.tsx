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
/* eslint-disable react/no-multi-comp */
import React from 'react';

import ImageIcon from '../components/common/icons/ImageIcon';
import PdfIcon from '../components/common/icons/PdfIcon';
import AudioIcon from '../components/common/icons/AudioIcon';
import VideoIcon from '../components/common/icons/VideoIcon';
import UnsupportedFileIcon from '../components/common/icons/UnsupportedFileIcon';

export const displayMediaSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const selectMediaIcon = (contentType: string, mediaType: string) => {
  switch (contentType) {
    case `image/${mediaType}`:
      return <ImageIcon width="48px" height="48px" />;
    case `application/pdf`:
      return <PdfIcon width="48px" height="48px" />;
    case `audio/${mediaType}`:
      return <AudioIcon width="40px" height="40px" />;
    case `video/${mediaType}`:
      return <VideoIcon width="40px" height="40px" />;
    default:
      return <UnsupportedFileIcon width="48px" height="48px" />;
  }
};
