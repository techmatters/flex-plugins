import { useEffect, useRef } from 'react';

const usePrevious = (value: any, initial: any = null) => {
  const ref = useRef(initial);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePrevious;
