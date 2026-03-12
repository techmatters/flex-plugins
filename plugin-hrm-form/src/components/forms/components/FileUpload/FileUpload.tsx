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
import { Template } from '@twilio/flex-ui';
import { useFormContext } from 'react-hook-form';

import { FormInputBaseProps } from '../types';
import UploadFileInput from '../../../common/forms/UploadFileInput';
import { RequiredAsterisk } from '../styles';

type FileUploadCustomHandlers = {
  onFileChange: (event: any) => Promise<string>;
  onDeleteFile: (fileName: string) => Promise<void>;
};

type Props = FormInputBaseProps & {
  description: string;
  customHandlers: FileUploadCustomHandlers;
};

const FileUpload: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
  description,
  customHandlers,
}) => {
  const { errors, clearErrors, register, setValue, watch } = useFormContext();
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);

  return (
    <UploadFileInput
      errors={errors}
      clearErrors={clearErrors}
      register={register}
      setValue={setValue}
      watch={watch}
      rules={registerOptions}
      path={inputId}
      label={labelTextComponent}
      description={description}
      onFileChange={customHandlers.onFileChange}
      onDeleteFile={customHandlers.onDeleteFile}
      updateCallback={updateCallback}
      RequiredAsterisk={RequiredAsterisk}
      initialValue={initialValue}
      htmlElRef={htmlElRef}
      isEnabled={isEnabled}
    />
  );
};

export default FileUpload;
