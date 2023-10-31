/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { ContactRawJson } from '../../types/types';

// Action types
export const CHANGE_ROUTE = 'routing/change-route';
export const OPEN_MODAL = 'routing/open-modal';
export const CLOSE_MODAL = 'routing/close-modal';
export const GO_BACK = 'routing/go-back';

export type TabbedFormSubroutes =
  | 'contactlessTask'
  | 'callerInformation'
  | 'childInformation'
  | 'categories'
  | 'caseInformation';

export type RouteWithModalSupport = {
  route: 'tabbed-forms' | 'case' | 'case-list' | 'search';
  activeModal?: AppRoutes[];
};

export type TabbedFormRoute = {
  route: 'tabbed-forms';
  subroute?: TabbedFormSubroutes;
  autoFocus?: boolean;
} & RouteWithModalSupport;

export type SearchRoute = {
  route: 'search';
  subroute: 'form' | 'case-results' | 'contact-results';
};

export const NewCaseSectionSubroutes = {
  Note: 'note',
  Referral: 'referral',
  Household: 'household',
  Perpetrator: 'perpetrator',
  Incident: 'incident',
  Document: 'document',
  CaseSummary: 'caseSummary',
} as const;

const OtherCaseRoutes = {
  CasePrintView: 'case-print-view',
} as const;

export type CaseSectionSubroute = typeof NewCaseSectionSubroutes[keyof typeof NewCaseSectionSubroutes];

export const NewCaseSubroutes = Object.freeze({
  ...NewCaseSectionSubroutes,
  ...OtherCaseRoutes,
});

export enum CaseItemAction {
  Add = 'add',
  Edit = 'edit',
  View = 'view',
}

type CaseListRoute = RouteWithModalSupport & {
  route: 'case-list';
  subroute: 'case-list';
};

type CaseCoreRoute = {
  route: 'case';
  autoFocus?: boolean;
};

type CaseHomeRoute = CaseCoreRoute &
  RouteWithModalSupport & {
    subroute: 'home';
  };

type CaseSectionRoute = CaseCoreRoute & {
  subroute?: CaseSectionSubroute;
};

export type EditCaseSectionRoute = CaseSectionRoute & {
  action: CaseItemAction.Edit;
  id: string;
};

export type AddCaseSectionRoute = CaseSectionRoute & {
  action: CaseItemAction.Add;
};

export type ViewCaseSectionRoute = CaseSectionRoute & {
  action: CaseItemAction.View;
  id: string;
};

export type CasePrintRoute = CaseCoreRoute & {
  subroute: typeof OtherCaseRoutes.CasePrintView;
};

export type CaseRoute =
  | AddCaseSectionRoute
  | EditCaseSectionRoute
  | ViewCaseSectionRoute
  | CaseHomeRoute
  | CasePrintRoute;

export function isAddCaseSectionRoute(appRoute: AppRoutes): appRoute is AddCaseSectionRoute {
  return (<any>appRoute).action === CaseItemAction.Add;
}

export function isViewCaseSectionRoute(appRoute: AppRoutes): appRoute is ViewCaseSectionRoute {
  return (<any>appRoute).action === CaseItemAction.View;
}

export function isEditCaseSectionRoute(appRoute: AppRoutes): appRoute is EditCaseSectionRoute {
  return (<any>appRoute).action === CaseItemAction.Edit;
}

export function isRouteModal(route: AppRoutes | undefined): boolean {
  return isRouteWithModalSupport(route) && Boolean(route?.activeModal?.length) && route.activeModal!.length > 0;
}

// Routes that may lead to Case screen (maybe we need an improvement here)
export type AppRoutesWithCase =
  // TODO: enum the possible subroutes on each route
  CaseRoute;

export function isCaseRoute(appRoute: AppRoutes): appRoute is AppRoutesWithCase {
  return appRoute?.route === 'case';
}

export type CSAMReportRoute = {
  route: 'csam-report';
  subroute: 'form' | 'loading' | 'status' | 'report-type-picker';
  previousRoute: AppRoutes;
};

type ContactViewRoute = {
  route: 'contact';
  subroute: 'view';
  id: string;
};

export type ContactEditRoute = {
  route: 'contact';
  subroute: 'edit';
  id: string;
  form: keyof Pick<ContactRawJson, 'childInformation' | 'callerInformation' | 'caseInformation' | 'categories'>;
};

type ContactRoute = ContactViewRoute | ContactEditRoute;

type OtherRoutes =
  | CSAMReportRoute
  | { route: 'select-call-type' }
  | TabbedFormRoute
  | SearchRoute
  | ContactRoute
  | CaseListRoute;

// The different routes we have in our app
export type AppRoutes = AppRoutesWithCase | OtherRoutes;

export function isRouteWithModalSupport(appRoute: any): appRoute is RouteWithModalSupport {
  return ['tabbed-forms', 'case', 'case-list', 'search'].includes(appRoute.route);
}

export enum ChangeRouteMode {
  Push = 'push',
  Replace = 'replace',
  Reset = 'reset',
}

type ChangeRouteAction = {
  type: typeof CHANGE_ROUTE;
  routing: AppRoutes;
  taskId: string;
  mode: ChangeRouteMode;
};

type OpenModalAction = {
  type: typeof OPEN_MODAL;
  routing: AppRoutes;
  taskId: string;
};

type GoBackAction = {
  type: typeof GO_BACK;
  taskId: string;
};

type CloseModalAction = {
  type: typeof CLOSE_MODAL;
  taskId: string;
  topRoute?: AppRoutes['route'];
};

export type RoutingActionType = ChangeRouteAction | GoBackAction | OpenModalAction | CloseModalAction;
export type RoutingState = {
  tasks: {
    [taskId: string]: AppRoutes[];
  };
  isAddingOfflineContact: boolean;
};
