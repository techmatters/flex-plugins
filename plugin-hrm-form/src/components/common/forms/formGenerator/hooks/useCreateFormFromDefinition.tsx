import React, { useRef } from 'react';
import { FormDefinition, FormItemDefinition } from 'hrm-form-definitions';
import { get } from 'lodash';

import { createInput, CreateInputParams } from '../inputGenerator';
import useFocus from '../../../../../utils/useFocus';
import { getInitialValue } from '../../formGenerators';

type UseFormFromDefinition = {
  definition: FormDefinition;
  parentsPath: CreateInputParams['parentsPath'];
  updateCallback: () => void;
  initialValues: Record<string, CreateInputParams['initialValue']>;
  shouldFocusFirstElement?: boolean;
  customHandlers?: CreateInputParams['customHandlers'];
  isItemEnabled?: (item: FormItemDefinition) => boolean;
};

const allwaysEnabled = () => true;

const useCreateFormFromDefinition = ({
  definition,
  parentsPath,
  updateCallback,
  initialValues,
  shouldFocusFirstElement,
  customHandlers,
  isItemEnabled = allwaysEnabled,
}: UseFormFromDefinition) => {
  const firstElementRef = useFocus(shouldFocusFirstElement);
  const memoInitialValues = useRef(initialValues);
  const memoIsItemEnabled = useRef(isItemEnabled);
  const updateCallbackRef = useRef(updateCallback);

  // Always get the latest callbacks but avoid re-building the whole form because of it
  React.useEffect(() => {
    memoIsItemEnabled.current = isItemEnabled;
    updateCallbackRef.current = updateCallback;
  }, [isItemEnabled, updateCallback]);

  return React.useMemo(() => {
    return definition.map((e: FormItemDefinition, index: number) => {
      const elementRef = index === 0 ? firstElementRef : null;
      const maybeValue = get(memoInitialValues.current, e.name);
      const initialValue = maybeValue === undefined ? getInitialValue(e) : maybeValue;

      return createInput({
        formItemDefinition: e,
        parentsPath,
        initialValue,
        isItemEnabled: () => memoIsItemEnabled.current(e), // use lambda to always get the latest version of the callback
        updateCallback: () => updateCallbackRef.current(), // use lambda to always get the latest version of the callback
        htmlElRef: elementRef,
        customHandlers,
      });
    });
  }, [customHandlers, definition, firstElementRef, parentsPath]);
};

export default useCreateFormFromDefinition;
