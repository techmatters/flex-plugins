// Action types
export const CHANGE_ROUTE = 'CHANGE_ROUTE';

// This is not compatible with dynamic tabs, while using the "tab number" is. Will we ever support that?
export type TabbedFormSubroutes =
  | 'search'
  | 'callerInformation'
  | 'childInformation'
  | 'caseInformation'
  | 'categories';

export const NewCaseSubroutes = {
  AddNote: 'add-note',
  AddHousehold: 'add-household',
  AddPerpetrator: 'add-perpetrator',
  ViewContact: 'view-contact',
  ViewNote: 'view-note',
  ViewHousehold: 'view-household',
  ViewPerpetrator: 'view-perpetrator',
} as const;

// The different routes we have in our app
export type AppRoutes =
  // TODO: enum the possible subroutes on each route
  | { route: 'tabbed-forms'; subroute?: TabbedFormSubroutes }
  | { route: 'new-case'; subroute?: typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes] }
  | { route: 'select-call-type' };

type ChangeRouteAction = {
  type: typeof CHANGE_ROUTE;
  routing: AppRoutes;
  taskId: string;
};

export type RoutingActionType = ChangeRouteAction;
