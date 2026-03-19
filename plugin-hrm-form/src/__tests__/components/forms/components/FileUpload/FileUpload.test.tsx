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

import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FormProvider, useForm } from 'react-hook-form';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import FileUpload from '../../../../../components/forms/components/FileUpload/FileUpload';
import { getInputType } from '../../../../../components/common/forms/formGenerators';
import HrmTheme from '../../../../../styles/HrmTheme';

// Mocked to avoid loadDefinition.js requiring @babel/runtime (infrastructure gap)
jest.mock('hrm-form-definitions', () => ({
  FormInputType: {
    Input: 'input',
    SearchInput: 'search-input',
    NumericInput: 'numeric-input',
    Email: 'email',
    RadioInput: 'radio-input',
    ListboxMultiselect: 'listbox-multiselect',
    Select: 'select',
    DependentSelect: 'dependent-select',
    Checkbox: 'checkbox',
    MixedCheckbox: 'mixed-checkbox',
    Textarea: 'textarea',
    DateInput: 'date-input',
    TimeInput: 'time-input',
    FileUpload: 'file-upload',
    Button: 'button',
    CopyTo: 'copy-to',
    CustomContactComponent: 'custom-contact-component',
  },
}));

const themeConf = { colorTheme: HrmTheme };

/**
 * FileUpload delegates to UploadFileInput which uses Material UI components that require
 * the Twilio Flex theme. We wrap with StorelessThemeProvider to provide the required theme.
 */
const FileUploadFormWrapper: React.FC<{}> = ({ children }) => {
  const methods = useForm();
  return (
    // @ts-ignore: StorelessThemeProvider's themeConf type differs between the installed and expected @twilio/flex-ui version
    <StorelessThemeProvider themeConf={themeConf}>
      <FormProvider {...methods}>{children}</FormProvider>
    </StorelessThemeProvider>
  );
};

const inputId = 'inputID';
const label = 'input label';
const description = 'Upload a file';
const customHandlers = {
  onFileChange: jest.fn().mockResolvedValue('file-url'),
  onDeleteFile: jest.fn().mockResolvedValue(undefined),
};
const defaultProps = {
  inputId,
  label,
  initialValue: '',
  isEnabled: true,
  updateCallback: jest.fn(),
  registerOptions: {},
  htmlElRef: null,
  description,
  customHandlers,
};

describe('FileUpload', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<FileUpload {...defaultProps} />)).toThrow();
  });

  test('on render, file upload UI mounts successfully', () => {
    const { container } = render(<FileUpload {...defaultProps} />, {
      wrapper: FileUploadFormWrapper,
    });

    // UploadFileInput renders and mounts without errors
    expect(container).toBeInTheDocument();
  });
});

describe('FileUpload via getInputType (parity)', () => {
  const def = {
    type: 'file-upload' as any,
    name: inputId,
    label,
    description,
  };

  test('on render, file upload UI mounts successfully', () => {
    const input = getInputType([], jest.fn(), customHandlers)(def)('');

    const { container } = render(input, { wrapper: FileUploadFormWrapper });

    // Both old and new delegate to UploadFileInput — verify it mounts without errors
    expect(container).toBeInTheDocument();
  });
});
