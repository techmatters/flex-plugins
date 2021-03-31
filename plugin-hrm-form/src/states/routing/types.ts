// Action types
export const CHANGE_ROUTE = 'CHANGE_ROUTE';

export type TabbedFormSubroutes =
  | 'search'
  | 'contactlessTask'
  | 'callerInformation'
  | 'childInformation'
  | 'categories'
  | 'caseInformation';

export const NewCaseSubroutes = {
  AddNote: 'add-note',
  AddReferral: 'add-referral',
  AddHousehold: 'add-household',
  AddPerpetrator: 'add-perpetrator',
  AddIncident: 'add-incident',
  ViewContact: 'view-contact',
  ViewNote: 'view-note',
  ViewHousehold: 'view-household',
  ViewPerpetrator: 'view-perpetrator',
  ViewIncident: 'view-incident',
  ViewReferral: 'view-referral',
  CasePrintView: 'case-print-view',
} as const;

// The different routes we have in our app
export type AppRoutes =
  // TODO: enum the possible subroutes on each route
  | {
      route: 'tabbed-forms';
      subroute?: TabbedFormSubroutes | typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes];
    }
  | {
      route: 'new-case';
      subroute?: typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes];
    }
  | {
      route: 'select-call-type';
      subroute?: typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes];
    };

type ChangeRouteAction = {
  type: typeof CHANGE_ROUTE;
  routing: AppRoutes;
  taskId: string;
};

export type RoutingActionType = ChangeRouteAction;
