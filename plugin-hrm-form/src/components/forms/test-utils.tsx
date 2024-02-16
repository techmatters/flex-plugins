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
import { FormProvider, UseFormMethods, useForm } from 'react-hook-form';

export const mockFormMethods = (): UseFormMethods => ({
  clearErrors: jest.fn(),
  control: {} as any,
  errors: {},
  formState: {} as any,
  getValues: jest.fn(),
  handleSubmit: jest.fn(),
  register: jest.fn(() => jest.fn()),
  reset: jest.fn(),
  setError: jest.fn(),
  setValue: jest.fn(),
  trigger: jest.fn(),
  unregister: jest.fn(),
  watch: jest.fn(),
});

export const wrapperFormProvider = (
  mockedMethods: Partial<UseFormMethods> = {},
  useFormOptions: Parameters<typeof useForm> = [],
) => ({ children }: { children?: React.ReactNode }) => {
  const methods = useForm(...useFormOptions);
  return <FormProvider {...{ ...methods, ...mockedMethods }}>{children}</FormProvider>;
};
