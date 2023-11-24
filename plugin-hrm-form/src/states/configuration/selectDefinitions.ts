import { RootState } from '..';
import { namespace } from '../storeNamespaces';

export const selectDefinitionVersions = (state: RootState) => state[namespace].configuration.definitionVersions;

export const selectCurrentDefinitionVersion = (state: RootState) =>
  state[namespace].configuration.currentDefinitionVersion;
