/* eslint-disable react/prop-types */
import React, { useState, useRef, ReactDOM } from 'react';
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
import type { HTMLElementRef } from './types';

type UploadFileInputProps = {
  label: string | JSX.Element;
  errors: any;
  clearErrors: any;
  register: any;
  setValue: any;
  watch: any;
  rules: any;
  path: any;
  description: any;
  onFileChange: any;
  onDeleteFile: any;
  updateCallback: any;
  RequiredAsterisk: any;
  initialValue: any;
  htmlElRef?: HTMLElementRef;
};

const UploadFileInput: React.FC<UploadFileInputProps> = ({
  errors,
  clearErrors,
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
  htmlElRef,
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
      clearErrors(path); // Error was not being cleared (maybe because we're using a hidden field?)

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
      setValue(path, null);

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
            {typeof label === 'string' ? <Template code={`${label}`} /> : label}
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
          <StyledNextStepButton
            id="upload-button-styled"
            disabled={isLoading}
            onClick={() => fileUploadRef.current.click()}
            innerRef={() => {
              if (htmlElRef) {
                // Couldn't get HTML element from innerRef. As a workaround, we getting the element by its id
                const htmlButton = document.getElementById('upload-button-styled');
                htmlElRef.current = htmlButton;
              }
            }}
          >
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
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,"
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
