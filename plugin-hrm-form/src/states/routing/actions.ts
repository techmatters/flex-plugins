import { RoutingActionType, AppRoutes, CHANGE_ROUTE } from './types';

// Action creators
export const changeRoute = (routing: AppRoutes, taskId: string): RoutingActionType => ({
  type: CHANGE_ROUTE,
  routing,
  taskId,
});
