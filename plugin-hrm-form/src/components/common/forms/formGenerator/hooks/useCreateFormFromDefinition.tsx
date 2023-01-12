import React, { useRef } from 'react';
import { FormDefinition, FormItemDefinition } from 'hrm-form-definitions';
import { get } from 'lodash';

// import { createInput, CreateInputParams, getInitialValue } from '../inputGenerator';
import useFocus from '../../../../../utils/useFocus';
import { getInitialValue, getInputType } from '../../formGenerators';

type UseFormFromDefinition = any;
// {
//   definition: FormDefinition;
//   parentsPath: CreateInputParams['parentsPath'];
//   updateCallback: () => void;
//   initialValues: Record<string, CreateInputParams['initialValue']>;
//   shouldFocusFirstElement?: boolean;
//   customHandlers?: CreateInputParams['customHandlers'];
//   isItemEnabled?: (item: FormItemDefinition) => boolean;
// };

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
  const memoParentsPath = useRef(parentsPath);
  const memoInitialValues = useRef(initialValues);
  const memoIsItemEnabled = useRef(isItemEnabled);
  const updateCallbackRef = useRef(updateCallback);

  // Always get the latest callback but avoid re-building the whole form because of it
  React.useEffect(() => {
    updateCallbackRef.current = updateCallback;
  }, [updateCallback]);

  return React.useMemo(() => {
    return definition.map((e: FormItemDefinition, index: number) => {
      const elementRef = index === 0 ? firstElementRef : null;
      const maybeValue = get(memoInitialValues.current, e.name);
      const initialValue = maybeValue === undefined ? getInitialValue(e) : maybeValue;
      const disabled = !memoIsItemEnabled.current(e);

      return getInputType(memoParentsPath.current, () => updateCallbackRef.current(), customHandlers)(e)(
        initialValue,
        elementRef,
        !disabled,
      );
      /*
       * return createInput({
       *   formItemDefinition: e,
       *   parentsPath: memoParentsPath.current,
       *   initialValue,
       *   disabled,
       *   updateCallbackRef,
       *   htmlElRef: elementRef,
       *   customHandlers,
       * });
       */
    });
  }, [customHandlers, definition, firstElementRef]);
};

export default useCreateFormFromDefinition;
