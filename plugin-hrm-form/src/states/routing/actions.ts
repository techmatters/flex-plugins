import { RoutingActionType, AppRoutes, CHANGE_ROUTE, ADD_OFFLINE_CONTACT } from './types';

// Action creators
export const changeRoute = (routing: AppRoutes, taskId: string): RoutingActionType => ({
  type: CHANGE_ROUTE,
  routing,
  taskId,
});

export const addOfflineContact = (): RoutingActionType => ({
  type: ADD_OFFLINE_CONTACT,
});
