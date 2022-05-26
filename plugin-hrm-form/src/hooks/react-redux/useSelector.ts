import { useEffect, useState } from 'react';
import { Manager } from '@twilio/flex-ui';

import { RootState } from '../../states';

const useSelector = <T = unknown>(selector: (state: RootState) => T) => {
  const { store } = Manager.getInstance();
  const { getState, subscribe } = store;

  const [state, setState] = useState(selector(getState()));

  const updateState = () => {
    const newReduxState = getState();
    const newValue = selector(newReduxState);

    const hasChanged = newValue !== state;

    if (hasChanged) {
      // Only rerender if selected value changed
      setState(newValue);
    }
  };

  useEffect(() => {
    const unsuscribe = subscribe(updateState);

    return () => unsuscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};

export default useSelector;
