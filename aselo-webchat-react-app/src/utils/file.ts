/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { extension as mimeToExtension } from 'mime-types';
import { Dispatch } from 'redux';

import { addNotification } from '../store/actions/genericActions';
import { notifications } from '../notifications';
import { roundFileSizeInMB } from './roundFileSizeInMB';
import { FileAttachmentConfig } from '../definitions';

const MAX_DISPLAYED_CHAR_FOR_FIRST_PART = 14;
const MAX_DISPLAYED_CHAR_FOR_SECOND_PART = 5;

export const shortenFileName = (name: string, maxChar = 20) => {
  // eslint-disable-next-line prefer-named-capture-group
  const [, filename, fileExtension] = name.match(/^(.+)(\.[\S]*)$/) || [];
  if (!filename) {
    return name;
  }

  if (filename.length <= maxChar) return name;

  return `${filename.substring(0, MAX_DISPLAYED_CHAR_FOR_FIRST_PART)}[...]${filename.substring(
    filename.length - MAX_DISPLAYED_CHAR_FOR_SECOND_PART,
  )}${fileExtension}`;
};

/*
 * Validates all provided files and shows an error notification for every invalid file.
 * Returns all valid files.
 */
export const validateFiles = (
  files: File[],
  dispatch: Dispatch,
  attachedFiles?: File[],
  fileAttachmentConfig?: FileAttachmentConfig,
): File[] => {
  return files.reduce<File[]>((validFilesAcc, file) => {
    if (
      attachedFiles &&
      attachedFiles.some(
        attachedFile =>
          file.name === attachedFile.name && file.type === attachedFile.type && file.size === attachedFile.size,
      )
    ) {
      dispatch(
        addNotification(
          notifications.fileAttachmentAlreadyAttachedNotification({
            fileName: file.name,
          }),
        ),
      );
    } else if (fileAttachmentConfig?.maxFileSize && file.size > fileAttachmentConfig.maxFileSize) {
      dispatch(
        addNotification(
          notifications.fileAttachmentInvalidSizeNotification({
            fileName: file.name,
            maxFileSize: `${roundFileSizeInMB(fileAttachmentConfig?.maxFileSize)}MB`,
          }),
        ),
      );
    } else if (
      fileAttachmentConfig?.acceptedExtensions &&
      !fileAttachmentConfig.acceptedExtensions.includes(mimeToExtension(file.type) as string)
    ) {
      dispatch(
        addNotification(
          notifications.fileAttachmentInvalidTypeNotification({
            fileName: file.name,
          }),
        ),
      );
    } else {
      validFilesAcc.push(file);
    }

    return validFilesAcc;
  }, []);
};
