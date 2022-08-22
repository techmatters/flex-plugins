// Action types
export const CHANGE_ROUTE = 'CHANGE_ROUTE';

export type TabbedFormSubroutes =
  | 'search'
  | 'contactlessTask'
  | 'callerInformation'
  | 'childInformation'
  | 'categories'
  | 'caseInformation';

export const NewCaseSectionSubroutes = {
  Note: 'note',
  Referral: 'referral',
  Household: 'household',
  Perpetrator: 'perpetrator',
  Incident: 'incident',
  Document: 'document',
  CaseSummary: 'caseSummary',
} as const;

export type CaseSectionSubroute = typeof NewCaseSectionSubroutes[keyof typeof NewCaseSectionSubroutes];

export const NewCaseOtherSubroutes = {
  ViewContact: 'view-contact',
  CasePrintView: 'case-print-view',
} as const;

export const NewCaseSubroutes = Object.freeze(Object.assign(NewCaseOtherSubroutes, NewCaseSectionSubroutes));

export enum CaseItemAction {
  Add = 'add',
  Edit = 'edit',
  View = 'view',
}

export type AppRoutesWithCaseAndAction =
  | {
      route: 'tabbed-forms';
      subroute?: CaseSectionSubroute;
      action: CaseItemAction;
      autoFocus?: boolean;
    }
  | {
      route: 'new-case';
      subroute?: CaseSectionSubroute;
      action: CaseItemAction;
      autoFocus?: boolean;
    }
  | {
      route: 'select-call-type';
      subroute?: CaseSectionSubroute;
      action: CaseItemAction;
    };

export function isAppRoutesWithCaseAndAction(appRoute: AppRoutes): appRoute is AppRoutesWithCaseAndAction {
  return Object.values(<any>NewCaseSectionSubroutes).includes(appRoute.subroute);
}

// Routes that may lead to Case screen (maybe we need an improvement here)
export type AppRoutesWithCase =
  // TODO: enum the possible subroutes on each route
  | AppRoutesWithCaseAndAction
  | {
      route: 'tabbed-forms';
      subroute?: TabbedFormSubroutes | typeof NewCaseOtherSubroutes[keyof typeof NewCaseOtherSubroutes];
      autoFocus?: boolean;
    }
  | {
      route: 'new-case';
      subroute?: typeof NewCaseOtherSubroutes[keyof typeof NewCaseOtherSubroutes];
      autoFocus?: boolean;
    }
  | {
      route: 'select-call-type';
      subroute?: typeof NewCaseOtherSubroutes[keyof typeof NewCaseOtherSubroutes];
    };

export function isAppRouteWithCase(appRoute: AppRoutes): appRoute is AppRoutesWithCase {
  return ['tabbed-forms', 'new-case', 'select-call-type'].includes(appRoute.route);
}

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
