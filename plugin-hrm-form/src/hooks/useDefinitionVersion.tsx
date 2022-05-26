import { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';

import useSelector from './react-redux/useSelector';
import useDispatch from './react-redux/useDispatch';
import { configurationBase, namespace, RootState } from '../states';
import { getDefinitionVersion } from '../services/ServerlessService';
import { updateDefinitionVersion } from '../states/configuration/actions';

const useDefinitionVersion = (version: string) => {
  const definitionVersions = useSelector((state: RootState) => state[namespace][configurationBase].definitionVersions);
  const dispatch = useDispatch();

  const [error, seterror] = useState(null);

  useEffect(() => {
    const fetchDefinitionVersions = async (v: string) => {
      try {
        const definitionVersion = await getDefinitionVersion(v as any);

        dispatch(updateDefinitionVersion(v, definitionVersion));
      } catch (err) {
        seterror(err.message || err);
      }
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions(version);
    }
  }, [definitionVersions, dispatch, version]);

  return { definitionVersion: definitionVersions[version] || null, error };
};

export default useDefinitionVersion;
