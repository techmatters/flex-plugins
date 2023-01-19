import React from 'react';
import { FormProvider, UseFormMethods } from 'react-hook-form';

export const createFormMethods = (): UseFormMethods => ({
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

export const wrapperFormProvider = (methods: UseFormMethods) => ({ children }: { children?: React.ReactNode }) => (
  <FormProvider {...methods}>{children}</FormProvider>
);
