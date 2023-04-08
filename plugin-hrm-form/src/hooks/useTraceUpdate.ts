import { useEffect, useRef } from 'react';

export default function useTraceUpdate(props, name: string) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log(`[${name}]`, 'Changed props:', changedProps);
    }
    prev.current = props;
  });
}
