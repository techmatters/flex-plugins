/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react';
import { get } from 'lodash';
import { Template } from '@twilio/flex-ui';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { CircularProgress } from '@material-ui/core';

import {
  Box,
  FormError,
  Row,
  FormInput,
  UploadFileLabel,
  UploadFileFileName,
  StyledNextStepButton,
} from '../../../styles/HrmStyles';
import { StyledLink } from '../../../styles/search';
import UploadIcon from '../icons/UploadIcon';
import { formatFileNameAtAws } from '../../../utils';

const UploadFileInput = ({
  errors,
  register,
  setValue,
  watch,
  rules,
  path,
  label,
  description,
  onFileChange,
  onDeleteFile,
  updateCallback,
  RequiredAsterisk,
  initialValue,
}) => {
  const [isLoading, setLoading] = useState(false);
  const fileUploadRef = useRef<HTMLButtonElement>();

  const fileName = watch(path);
  const error = get(errors, path);
  const showUploadButton = !Boolean(fileName);

  const handleChange = async event => {
    try {
      setLoading(true);
      const fileNameAtAws = await onFileChange(event);
      setLoading(false);
      setValue(path, fileNameAtAws);

      updateCallback();
    } catch (err) {
      setLoading(false);
      console.log({ err });
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDeleteFile(fileName);
      setLoading(false);
      setValue(path, '');

      updateCallback();
    } catch (err) {
      setLoading(false);
      console.log({ err });
    }
  };

  return (
    <>
      <Row>
        <Box marginBottom="8px">
          <UploadFileLabel>
            <Template code={`${label}`} />
            {rules.required && <RequiredAsterisk />}
          </UploadFileLabel>
        </Box>
      </Row>
      <Row>
        <Box marginBottom="20px">
          <Template code={`${description}`} />
        </Box>
      </Row>
      {showUploadButton && (
        <>
          <StyledNextStepButton disabled={isLoading} onClick={() => fileUploadRef.current.click()}>
            {isLoading && (
              <Box marginRight="10px">
                <CircularProgress color="inherit" size={20} />
              </Box>
            )}
            {!isLoading && <UploadIcon style={{ fontSize: '20px', marginRight: 5 }} />}
            <Template code="UploadFile-ButtonText" />
          </StyledNextStepButton>
          <FormInput
            id="file-input"
            type="file"
            error={Boolean(error)}
            aria-invalid={Boolean(error)}
            aria-describedby={`${path}-error`}
            onChange={handleChange}
            defaultValue={initialValue}
            innerRef={fileUploadRef}
            style={{ visibility: 'hidden', height: 0 }}
          />
          <input id={path} name={path} type="hidden" ref={register(rules)} />
        </>
      )}
      {!showUploadButton && (
        <>
          <UploadFileFileName>
            <AttachFileIcon style={{ fontSize: '20px', marginRight: 5 }} />
            {formatFileNameAtAws(fileName)}
          </UploadFileFileName>
          {isLoading && (
            <Box marginLeft="25px" marginTop="10px">
              <CircularProgress color="inherit" size={20} />
            </Box>
          )}
          {!isLoading && (
            <StyledLink underline onClick={handleDelete}>
              <Box marginLeft="20px">Delete</Box>
            </StyledLink>
          )}
        </>
      )}
      {error && (
        <FormError>
          <Template id={`${path}-error`} code={error.message} />
        </FormError>
      )}
    </>
  );
};
UploadFileInput.displayName = 'UploadFileInput';
export default UploadFileInput;
