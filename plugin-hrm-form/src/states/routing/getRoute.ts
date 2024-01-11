import { AppRoutes, isRouteWithModalSupport, RoutingState } from './types';
import { RootState } from '..';
import { namespace } from '../storeNamespaces';

const getCurrentTopmostRouteStack = (baseRouteStack: AppRoutes[]): AppRoutes[] | undefined => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      return getCurrentTopmostRouteStack(currentRoute.activeModal);
    }
  }
  return baseRouteStack;
};

export const getCurrentTopmostRouteStackForTask = (state: RoutingState, taskSid: string): AppRoutes[] =>
  getCurrentTopmostRouteStack(state.tasks[taskSid]);

export const getCurrentTopmostRouteForTask = (state: RoutingState, taskSid: string): AppRoutes | undefined => {
  const topStack = getCurrentTopmostRouteStack(state.tasks[taskSid]);
  return topStack.length ? topStack[topStack.length - 1] : undefined;
};

export const selectCurrentTopmostRouteForTask = (state: RootState, taskSid: string): AppRoutes | undefined =>
  getCurrentTopmostRouteForTask(state[namespace].routing, taskSid);

export const getCurrentBaseRoute = (state: RoutingState, taskSid: string): AppRoutes | undefined => {
  const baseRouteStack = state.tasks[taskSid];
  return baseRouteStack?.length ? baseRouteStack[baseRouteStack.length - 1] : undefined;
};

export const selectCurrentBaseRoute = (
  { [namespace]: { routing } }: RootState,
  taskSid: string,
): AppRoutes | undefined => getCurrentBaseRoute(routing, taskSid);
