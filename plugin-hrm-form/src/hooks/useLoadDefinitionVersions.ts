import React from 'react';
import { useDispatch } from 'react-redux';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { updateDefinitionVersion } from '../states/configuration/actions';
import { getMissingDefinitionVersions } from '../utils/definitionVersions';

const dedup = <T>(arr: T[]) => Array.from(new Set(arr));

// eslint-disable-next-line import/no-unused-modules
export const useLoadDefinitionVersions = <T>(
  withVersion: T | T[],
  extractVersionFromObject: (t: T) => DefinitionVersionId,
) => {
  const [isLoadingDefinitionVersions, setIsLoadingDefinitionVersion] = React.useState(false);
  const dispatch = useDispatch();

  const extractVersionFromObjectRef = React.useRef(extractVersionFromObject);

  React.useEffect(() => {
    extractVersionFromObjectRef.current = extractVersionFromObject;
  }, [extractVersionFromObject]);

  React.useEffect(() => {
    const fetchMissingDefinitionVersions = async () => {
      setIsLoadingDefinitionVersion(true);

      const definitionsVersions = Array.isArray(withVersion)
        ? dedup(withVersion.map(extractVersionFromObjectRef.current))
        : [extractVersionFromObjectRef.current(withVersion)];

      const loadedDefinitions = await getMissingDefinitionVersions(definitionsVersions);

      loadedDefinitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));
      setIsLoadingDefinitionVersion(false);
    };

    fetchMissingDefinitionVersions();
  }, [dispatch, withVersion]);

  return { isLoadingDefinitionVersions };
};
