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
  AddDocument: 'add-document',
  ViewContact: 'view-contact',
  ViewNote: 'view-note',
  ViewReferral: 'view-referral',
  ViewHousehold: 'view-household',
  ViewPerpetrator: 'view-perpetrator',
  ViewIncident: 'view-incident',
  ViewDocument: 'view-document',
  CasePrintView: 'case-print-view',
} as const;

// Routes that may lead to Case screen (maybe we need an improvement here)
export type AppRoutesWithCase =
  // TODO: enum the possible subroutes on each route
  | {
      route: 'tabbed-forms';
      subroute?: TabbedFormSubroutes | typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes];
      autoFocus?: boolean;
    }
  | {
      route: 'new-case';
      subroute?: typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes];
      autoFocus?: boolean;
    }
  | {
      route: 'select-call-type';
      subroute?: typeof NewCaseSubroutes[keyof typeof NewCaseSubroutes];
    };

export type CSAMReportRoute = {
  route: 'csam-report';
  subroute: 'form' | 'loading' | 'status';
  previousRoute: AppRoutes;
};

type OtherRoutes = CSAMReportRoute;

// The different routes we have in our app
export type AppRoutes = AppRoutesWithCase | OtherRoutes;

type ChangeRouteAction = {
  type: typeof CHANGE_ROUTE;
  routing: AppRoutes;
  taskId: string;
};

export type RoutingActionType = ChangeRouteAction;
