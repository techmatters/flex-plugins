/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react';
import { get } from 'lodash';
import { Template } from '@twilio/flex-ui';
import AttachFileIcon from '@material-ui/icons/AttachFile';

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

const UploadFileInput = ({
  errors,
  register,
  setValue,
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
  const [key, setKey] = useState('');
  const [localFileName, setLocalFileName] = useState('');

  const fileUploadRef = useRef<HTMLButtonElement>();

  const error = get(errors, path);
  const showUploadButton = !Boolean(key);

  const handleChange = async event => {
    try {
      const file = event.target.files[0];
      const fileNameAtAws = await onFileChange(event);

      // Local file name
      setValue(path, file.name);
      setLocalFileName(file.name);

      // Key (file name at AWS)
      setValue(`${path}-key`, fileNameAtAws);
      setKey(fileNameAtAws);

      updateCallback();
    } catch (err) {
      console.log({ err });
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteFile(key);

      // Clear RHF values
      setValue(path, '');
      setValue(`${path}-key`, '');

      // Clear state
      setKey('');
      setLocalFileName('');

      updateCallback();
    } catch (err) {
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
          <StyledNextStepButton onClick={() => fileUploadRef.current.click()}>
            <UploadIcon style={{ fontSize: '20px', marginRight: 5 }} />
            {label}
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
          <input id={`${path}-key`} name={`${path}-key`} type="hidden" ref={register(rules)} />
        </>
      )}
      {!showUploadButton && (
        <>
          <UploadFileFileName>
            <AttachFileIcon style={{ fontSize: '20px', marginRight: 5 }} />
            {localFileName}
          </UploadFileFileName>
          <StyledLink underline data-testid="PreviousContacts-ViewRecords" onClick={handleDelete}>
            <Box marginLeft="20px">Delete</Box>
          </StyledLink>
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
