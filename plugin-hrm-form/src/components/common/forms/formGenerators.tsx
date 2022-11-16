/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/no-multi-comp */
/* eslint-disable import/no-unused-modules */
/* eslint-disable react/display-name */
import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { get, pick } from 'lodash';
import { format, startOfDay } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { FormItemDefinition, FormDefinition, InputOption, SelectOption, MixedOrBool } from 'hrm-form-definitions';

import {
  Box,
  ColumnarBlock,
  TwoColumnLayout,
  FormLabel,
  DependentSelectLabel,
  FormError,
  Row,
  FormInput,
  FormDateInput,
  FormTimeInput,
  FormCheckBoxWrapper,
  FormCheckbox,
  FormMixedCheckbox,
  FormSelect,
  FormOption,
  FormSelectWrapper,
  FormTextArea,
  FormRadioInput,
  FormFieldset,
  FormLegend,
  FormListboxMultiselect,
  FormListboxMultiselectOptionsContainer,
  FormListboxMultiselectOption,
  FormListboxMultiselectOptionLabel,
} from '../../../styles/HrmStyles';
import type { HTMLElementRef } from './types';
import UploadIcon from '../icons/UploadIcon';
import UploadFileInput from './UploadFileInput';

/**
 * Utility functions to create initial state from definition
 * @param {FormItemDefinition} def Definition for a single input of a Form
 */
export const getInitialValue = (def: FormItemDefinition) => {
  switch (def.type) {
    case 'input':
    case 'numeric-input':
    case 'email':
    case 'textarea':
    case 'file-upload':
      return '';
    case 'date-input': {
      if (def.initializeWithCurrent) {
        return format(startOfDay(new Date()), 'yyyy-MM-dd');
      }

      return '';
    }
    case 'time-input': {
      if (def.initializeWithCurrent) {
        return format(new Date(), 'HH:mm');
      }

      return '';
    }
    case 'radio-input':
      return def.defaultOption ?? '';
    case 'listbox-multiselect':
      return [];
    case 'select':
      return def.defaultOption ? def.defaultOption : def.options[0].value;
    case 'dependent-select':
      return def.defaultOption.value;
    case 'copy-to':
    case 'checkbox':
      return Boolean(def.initialChecked);
    case 'mixed-checkbox':
      return def.initialChecked === undefined ? 'mixed' : def.initialChecked;
    default:
      return null;
  }
};

/**
 * Adds a new property to the given object, with the name of the given form item definition, and initial value will depend on it
 * @param obj the object to which add a property related to the provided form item definition
 * @param def the provided form item definition
 */
export const createStateItem = <T extends {}>(obj: T, def: FormItemDefinition): T => ({
  ...obj,
  [def.name]: getInitialValue(def),
});

export const ConnectForm: React.FC<{
  children: <P extends ReturnType<typeof useFormContext>>(args: P) => JSX.Element;
}> = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

const RequiredAsterisk = () => (
  <span aria-hidden style={{ color: 'red' }}>
    *
  </span>
);

const getRules = (field: FormItemDefinition): RegisterOptions =>
  pick(field, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

const bindCreateSelectOptions = (path: string) => (o: SelectOption) => (
  <FormOption key={`${path}-${o.label}-${o.value}`} value={o.value} isEmptyValue={o.value === ''}>
    {o.label}
  </FormOption>
);

/**
 * Helper function used to calclulate the element that should be focused for 'listbox-multiselect' type inputs
 */
const calculateNextFocusable = (currentValue: any[], options: InputOption[]) => {
  // If there's at least one selected option, return the index of the first one on the definition
  if (currentValue && currentValue.length) {
    return options.map(o => o.value).findIndex(v => v === currentValue[0]);
  }

  // Else return first option on the definition
  return 0;
};

/**
 * Helper function used to calclulate the tabIndex for each option of 'listbox-multiselect' type inputs
 */
const calculateOptionsTabIndexes = (currentValue: any[], options: InputOption[]) =>
  options.map((option, index) => (index === calculateNextFocusable(currentValue, options) ? undefined : -1));

/**
 * Creates a Form with each input connected to RHF's wrapping Context, based on the definition.
 * @param {string[]} parents Array of parents. Allows you to easily create nested form fields. https://react-hook-form.com/api#register.
 * @param {() => void} updateCallback Callback called to update form state. When is the callback called is specified in the input type.
 * @param {FormItemDefinition} def Definition for a single input.
 */
export const getInputType = (parents: string[], updateCallback: () => void, customHandlers?: CustomHandlers) => (
  def: FormItemDefinition,
) => (
  initialValue: any, // TODO: restrict this type
  htmlElRef?: HTMLElementRef,
  isEnabled: boolean = true,
) => {
  const rules = getRules(def);
  const path = [...parents, def.name].join('.');

  const labelTextComponent = <Template code={`${def.label}`} className=".fullstory-unmask" />;

  switch (def.type) {
    case 'input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  ref={ref => {
                    if (htmlElRef) {
                      htmlElRef.current = ref;
                    }

                    register(rules)(ref);
                  }}
                  defaultValue={initialValue}
                  disabled={!isEnabled}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'numeric-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  ref={ref => {
                    if (htmlElRef) {
                      htmlElRef.current = ref;
                    }

                    register({
                      ...rules,
                      pattern: { value: /^[0-9]+$/g, message: 'This field only accepts numeric input.' },
                    })(ref);
                  }}
                  defaultValue={initialValue}
                  disabled={!isEnabled}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'email':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  ref={ref => {
                    if (htmlElRef) {
                      htmlElRef.current = ref;
                    }

                    register({
                      ...rules,
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Entered value does not match email format' },
                    })(ref);
                  }}
                  defaultValue={initialValue}
                  disabled={!isEnabled}
                  type="email"
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'radio-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register, setValue, watch }) => {
            const [isMounted, setIsMounted] = React.useState(false); // value to avoid setting the default in the first render.

            React.useEffect(() => {
              if (isMounted && def.defaultOption) setValue(path, def.defaultOption);
              else setIsMounted(true);
            }, [isMounted, setValue]);

            const error = get(errors, path);
            const currentValue = watch(path);

            return (
              <FormFieldset
                error={Boolean(error)}
                aria-invalid={Boolean(error)}
                aria-describedby={`${path}-error`}
                disabled={!isEnabled}
              >
                {def.label && (
                  <Row>
                    <Box marginBottom="8px">
                      {labelTextComponent}
                      {rules.required && <RequiredAsterisk />}
                    </Box>
                  </Row>
                )}
                {def.options.map(({ value, label }, index) => (
                  <Box key={`${path}-${value}`} marginBottom="15px">
                    <FormLabel htmlFor={`${path}-${value}`}>
                      <Row>
                        <FormRadioInput
                          id={`${path}-${value}`}
                          data-testid={`${path}-${value}`}
                          name={path}
                          type="radio"
                          value={value}
                          onChange={updateCallback}
                          ref={ref => {
                            // If autofocus is pertinent, focus first radio input
                            if (index === 0 && htmlElRef) {
                              htmlElRef.current = ref;
                            }

                            register(rules)(ref);
                          }}
                          checked={currentValue === value}
                        />
                        <Template code={label} className=".fullstory-unmask" />
                      </Row>
                    </FormLabel>
                  </Box>
                ))}
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormFieldset>
            );
          }}
        </ConnectForm>
      );
    case 'listbox-multiselect':
      return (
        <ConnectForm key={path}>
          {({ errors, register, getValues }) => {
            const error = get(errors, path);

            const optionsRefs = React.useRef<HTMLElement[]>([]);
            const [optionsTabIndexes, setOptionsTabIndexes] = React.useState<number[]>([]);
            const [computeFocus, setComputeFocus] = React.useState(false);
            const [focusedOption, setFocusedOption] = React.useState(-1);

            // Effect to set optionsTabIndexes on the first render
            React.useEffect(() => {
              calculateOptionsTabIndexes(get(getValues(), path), def.options);
            }, [getValues]);

            // Effect that computes focus, triggered onFocus
            React.useEffect(() => {
              // Compute the element that should be focused onFocus
              if (computeFocus) {
                setFocusedOption(calculateNextFocusable(get(getValues(), path), def.options));
              }
            }, [computeFocus, getValues]);

            // Effect that focuses the corresponding option
            React.useEffect(() => {
              if (optionsRefs.current[focusedOption]) optionsRefs.current[focusedOption].focus();
            }, [focusedOption]);

            const handleOnKeyDown: React.KeyboardEventHandler<HTMLUListElement> = event => {
              if (event.key === 'ArrowDown') setFocusedOption(prev => (prev + 1 < def.options.length ? prev + 1 : 0));

              if (event.key === 'ArrowUp')
                setFocusedOption(prev => (prev - 1 >= 0 ? prev - 1 : def.options.length - 1));
            };

            const handleOnFocus: React.FocusEventHandler<HTMLUListElement> = () => {
              // When component is focused, trigger effect that computes focus and prevent tab to navigate inside of the component controls
              if (!computeFocus) {
                setOptionsTabIndexes(def.options.map(() => -1));
                setComputeFocus(true);
              }
            };

            const handleOnBlur: React.FocusEventHandler<HTMLUListElement> = event => {
              // If this element lost "focus-within" (none of it's childrens is focused), reset focus controls and recompute next tab
              if (!event.currentTarget.matches(':focus-within')) {
                setOptionsTabIndexes(calculateOptionsTabIndexes(get(getValues(), path), def.options));
                setFocusedOption(-1);
                setComputeFocus(false);
              }
            };

            return (
              <FormListboxMultiselect
                role="listbox"
                error={Boolean(error)}
                aria-invalid={Boolean(error)}
                aria-describedby={`${path}-error`}
                aria-multiselectable
                height={def.height}
                width={def.width}
                onKeyDown={handleOnKeyDown}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                data-testid={`listbox-multiselect-${path}`}
              >
                <Row>
                  <Box marginBottom="8px">
                    <FormLegend>
                      {labelTextComponent}
                      {rules.required && <RequiredAsterisk />}
                    </FormLegend>
                  </Box>
                </Row>
                <FormListboxMultiselectOptionsContainer>
                  {def.options.map(({ value, label }, index) => (
                    <Box key={`${path}-${value}`} marginBottom="5px">
                      <FormListboxMultiselectOption role="option">
                        <FormListboxMultiselectOptionLabel htmlFor={`${path}-${value}`}>
                          <Box marginRight="5px">
                            <FormCheckbox
                              id={`${path}-${value}`}
                              data-testid={`listbox-multiselect-option-${path}-${value}`}
                              name={path}
                              type="checkbox"
                              value={value}
                              onChange={updateCallback}
                              tabIndex={optionsTabIndexes[index]}
                              ref={ref => {
                                // If autofocus is pertinent, focus first checkbox
                                if (index === 0 && htmlElRef) {
                                  htmlElRef.current = ref;
                                }

                                // Add ref to optionsRefs array
                                optionsRefs.current[index] = ref;

                                register(rules)(ref);
                              }}
                              defaultChecked={initialValue.includes(value)}
                              disabled={!isEnabled}
                            />
                          </Box>
                          <Template code={label} className=".fullstory-unmask" />
                        </FormListboxMultiselectOptionLabel>
                      </FormListboxMultiselectOption>
                    </Box>
                  ))}
                </FormListboxMultiselectOptionsContainer>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormListboxMultiselect>
            );
          }}
        </ConnectForm>
      );
    case 'select':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            const createSelectOptions = bindCreateSelectOptions(path);

            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormSelectWrapper>
                  <FormSelect
                    id={path}
                    data-testid={path}
                    name={path}
                    error={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    ref={ref => {
                      if (htmlElRef) {
                        htmlElRef.current = ref;
                      }

                      register(rules)(ref);
                    }}
                    defaultValue={initialValue}
                    disabled={!isEnabled}
                  >
                    {def.options.map(createSelectOptions)}
                  </FormSelect>
                </FormSelectWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'dependent-select':
      return (
        <ConnectForm key={path}>
          {({ errors, register, watch, setValue }) => {
            const isMounted = React.useRef(false); // mutable value to avoid reseting the state in the first render. This preserves the "intialValue" provided
            const prevDependeeValue = React.useRef(undefined); // mutable value to store previous dependeeValue

            const dependeePath = [...parents, def.dependsOn].join('.');
            const dependeeValue = watch(dependeePath);

            React.useEffect(() => {
              if (isMounted.current && prevDependeeValue.current && dependeeValue !== prevDependeeValue.current) {
                setValue(path, def.defaultOption.value, { shouldValidate: true });
              } else isMounted.current = true;

              prevDependeeValue.current = dependeeValue;
            }, [setValue, dependeeValue]);

            const error = get(errors, path);
            const hasOptions = Boolean(dependeeValue && def.options[dependeeValue]);
            const shouldInitialize = initialValue && !isMounted.current;

            const validate = (data: any) =>
              hasOptions && def.required && data === def.defaultOption.value ? 'RequiredFieldError' : null;

            // eslint-disable-next-line no-nested-ternary
            const options: SelectOption[] = hasOptions
              ? [def.defaultOption, ...def.options[dependeeValue]]
              : shouldInitialize
              ? [def.defaultOption, { label: initialValue, value: initialValue }]
              : [def.defaultOption];

            const disabled = !hasOptions && !shouldInitialize;

            const createSelectOptions = bindCreateSelectOptions(path);

            return (
              <DependentSelectLabel htmlFor={path} disabled={disabled}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {hasOptions && rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormSelectWrapper>
                  <FormSelect
                    id={path}
                    data-testid={path}
                    name={path}
                    error={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    ref={ref => {
                      if (htmlElRef) {
                        htmlElRef.current = ref;
                      }

                      register({ validate })(ref);
                    }}
                    disabled={!isEnabled || disabled}
                    defaultValue={initialValue}
                  >
                    {options.map(createSelectOptions)}
                  </FormSelect>
                </FormSelectWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </DependentSelectLabel>
            );
          }}
        </ConnectForm>
      );
    case 'copy-to':
    case 'checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <FormCheckBoxWrapper error={Boolean(error)}>
                  <Box marginRight="5px">
                    <FormCheckbox
                      id={path}
                      data-testid={path}
                      name={path}
                      type="checkbox"
                      aria-invalid={Boolean(error)}
                      aria-describedby={`${path}-error`}
                      onChange={updateCallback}
                      ref={ref => {
                        if (htmlElRef) {
                          htmlElRef.current = ref;
                        }

                        register(rules)(ref);
                      }}
                      defaultChecked={initialValue}
                      disabled={!isEnabled}
                    />
                  </Box>
                  {labelTextComponent}
                  {rules.required && <RequiredAsterisk />}
                </FormCheckBoxWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'mixed-checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register, setValue }) => {
            React.useEffect(() => {
              register(path, rules);
            }, [register]);

            const initialChecked =
              initialValue === undefined || typeof initialValue !== 'boolean' ? 'mixed' : initialValue;
            const [checked, setChecked] = React.useState<MixedOrBool>(initialChecked);

            React.useEffect(() => {
              setValue(path, checked);
            }, [checked, setValue]);

            const error = get(errors, path);

            return (
              <FormLabel htmlFor={path}>
                <FormCheckBoxWrapper error={Boolean(error)}>
                  <Box marginRight="5px">
                    <FormMixedCheckbox
                      id={path}
                      data-testid={path}
                      type="checkbox"
                      className="mixed-checkbox"
                      aria-invalid={Boolean(error)}
                      aria-checked={checked}
                      aria-describedby={`${path}-error`}
                      onBlur={updateCallback}
                      onChange={() => {
                        if (checked === 'mixed') setChecked(true);
                        if (checked === true) setChecked(false);
                        if (checked === false) setChecked('mixed');
                      }}
                      ref={ref => {
                        if (htmlElRef) {
                          htmlElRef.current = ref;
                        }
                      }}
                      disabled={!isEnabled}
                    />
                  </Box>
                  {labelTextComponent}
                  {rules.required && <RequiredAsterisk />}
                </FormCheckBoxWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'textarea':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormTextArea
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  ref={ref => {
                    if (htmlElRef) {
                      htmlElRef.current = ref;
                    }

                    register(rules)(ref);
                  }}
                  rows={def.rows ? def.rows : 10}
                  width={def.width}
                  defaultValue={initialValue}
                  disabled={!isEnabled}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'time-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormTimeInput
                  type="time"
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  ref={ref => {
                    if (htmlElRef) {
                      htmlElRef.current = ref;
                    }

                    register(rules)(ref);
                  }}
                  defaultValue={initialValue}
                  disabled={!isEnabled}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'date-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    {labelTextComponent}
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormDateInput
                  type="date"
                  id={path}
                  data-testid={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  ref={ref => {
                    if (htmlElRef) {
                      htmlElRef.current = ref;
                    }

                    register(rules)(ref);
                  }}
                  defaultValue={initialValue}
                  disabled={!isEnabled}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'file-upload':
      return (
        <ConnectForm key={path}>
          {({ errors, clearErrors, register, setValue, watch }) => (
            <UploadFileInput
              errors={errors}
              clearErrors={clearErrors}
              register={register}
              setValue={setValue}
              watch={watch}
              rules={rules}
              path={path}
              label={labelTextComponent}
              description={def.description}
              onFileChange={customHandlers.onFileChange}
              onDeleteFile={customHandlers.onDeleteFile}
              updateCallback={updateCallback}
              RequiredAsterisk={RequiredAsterisk}
              initialValue={initialValue}
              htmlElRef={htmlElRef}
            />
          )}
        </ConnectForm>
      );
    default:
      return null;
  }
};

type FileUploadCustomHandlers = {
  onFileChange: (event: any) => Promise<string>;
  onDeleteFile: (fileName: string) => Promise<void>;
};

export type CustomHandlers = FileUploadCustomHandlers;

/**
 * Creates a Form with each input connected to RHF's wrapping Context, based on the definition.
 * @param {FormDefinition} definition Form definition (schema).
 * @param {string[]} parents Array of parents. Allows you to easily create nested form fields. https://react-hook-form.com/api#register.
 * @param {() => void} updateCallback Callback called to update form state. When is the callback called is specified in the input type (getInputType).
 */
export const createFormFromDefinition = (definition: FormDefinition) => (parents: string[]) => (
  initialValues: any,
  firstElementRef: HTMLElementRef,
  isEnabled: (item: FormItemDefinition) => boolean = () => true,
) => (updateCallback: () => void, customHandlers?: CustomHandlers): JSX.Element[] => {
  const bindGetInputType = getInputType(parents, updateCallback, customHandlers);

  return definition.map((e: FormItemDefinition, index: number) => {
    const elementRef = index === 0 ? firstElementRef : null;
    const maybeValue = get(initialValues, e.name);
    const initialValue = maybeValue === undefined ? getInitialValue(e) : maybeValue;
    return bindGetInputType(e)(initialValue, elementRef, isEnabled(e));
  });
};

export const addMargin = (margin: number) => (i: JSX.Element) => (
  <Box key={`${i.key}-wrapping-box`} marginTop={`${margin.toString()}px`} marginBottom={`${margin.toString()}px`}>
    {i}
  </Box>
);

export const disperseInputs = (margin: number) => (formItems: JSX.Element[]) => formItems.map(addMargin(margin));

export const splitInHalf = (formItems: JSX.Element[]) => {
  const m = Math.ceil(formItems.length / 2);

  const [l, r] = [formItems.slice(0, m), formItems.slice(m)];

  return [l, r];
};

export const splitAt = (n: number) => (formItems: JSX.Element[]) => [formItems.slice(0, n), formItems.slice(n)];

export const buildTwoColumnFormLayout = (formItems: JSX.Element[]) => {
  const items = disperseInputs(5)(formItems);

  const [l, r] = splitInHalf(items);

  return (
    <TwoColumnLayout>
      <ColumnarBlock>{l}</ColumnarBlock>
      <ColumnarBlock>{r}</ColumnarBlock>
    </TwoColumnLayout>
  );
};
