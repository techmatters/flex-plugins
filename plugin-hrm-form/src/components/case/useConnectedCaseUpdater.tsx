import { useEffect } from 'react';

import { setConnectedCase } from '../../states/case/actions';
import { Case } from '../../types/types';

/*
 * This check if the case object have values by iterating
 * through its properties and checking if any of them are empty or undefined.
 */
export const isCaseUpdated = (caseObject: Case): boolean => {
  return Object.keys(caseObject).some(key => {
    const value = caseObject[key];
    return (
      (typeof value === 'string' && value !== '') ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0)
    );
  });
};

const useConnectedCaseUpdater = (caseObject: Case, taskSid: string) => {
  useEffect(() => {
    const isFilled = isCaseUpdated(caseObject);

    if (isFilled) setConnectedCase(caseObject, taskSid);
  }, [caseObject, taskSid]);
};

export default useConnectedCaseUpdater;
