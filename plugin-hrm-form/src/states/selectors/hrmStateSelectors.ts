import { configurationBase, namespace, RootState } from '..';

export const selectCannedResponses = (state: RootState) =>
  state[namespace][configurationBase].currentDefinitionVersion?.cannedResponses;
