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
import { ContactRawJson, Profile, ProfileSection } from '../../types/types';

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
  | 'caseInformation'
  | 'profile'
  | 'profileEdit';

export type RouteWithModalSupport = {
  activeModal?: AppRoutes[];
};

export type TabbedFormRoute = {
  route: 'tabbed-forms';
  subroute?: TabbedFormSubroutes;
  autoFocus?: boolean;
} & RouteWithModalSupport;

export type SearchResultRoute = RouteWithModalSupport & {
  route: 'search';
  casesPage: number;
  contactsPage: number;
  subroute: 'case-results' | 'contact-results';
  action?: 'select-case';
};

export type SearchRoute =
  | (RouteWithModalSupport & {
      route: 'search';
      subroute: 'form';
      action?: 'select-case';
    })
  | SearchResultRoute;

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

type ProfileListRoute = RouteWithModalSupport & {
  route: 'profiles-list';
  subroute: 'profiles-list';
};

type ProfileHomeRoute = RouteWithModalSupport & {
  route: 'profile';
  subroute: 'home';
  profileId: Profile['id'];
};

const CONTEXTS = ['search', 'hrm-form', 'profile'] as const;

export type Contexts = typeof CONTEXTS[number];

export type RouteWithContext = {
  context?: Contexts;
};

export const isRouteWithContext = (route: any): route is RouteWithContext => {
  return CONTEXTS.includes((route as RouteWithContext).context);
};

type CaseCoreRoute = RouteWithContext & {
  route: 'case';
  caseId: string;
  autoFocus?: boolean;
  isCreating?: boolean;
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

export const PROFILE_TABS = {
  cases: 'cases',
  contacts: 'contacts',
  details: 'details',
} as const;

export type ProfileTabs = typeof PROFILE_TABS[keyof typeof PROFILE_TABS];

export type ProfileRoute = RouteWithModalSupport & {
  route: 'profile';
  id: Profile['id'];
  subroute?: ProfileTabs;
};

export type ProfileEditRoute = {
  route: 'profileEdit';
  id: Profile['id'];
};

export type ProfileSectionEditRoute = {
  route: 'profileSectionEdit';
  type: ProfileSection['sectionType'];
  id: Profile['id'];
};

export function isAddCaseSectionRoute(appRoute: AppRoutes): appRoute is AddCaseSectionRoute {
  return (<any>appRoute).action === CaseItemAction.Add;
}

export function isViewCaseSectionRoute(appRoute: AppRoutes): appRoute is ViewCaseSectionRoute {
  return (<any>appRoute).action === CaseItemAction.View;
}

export function isEditCaseSectionRoute(appRoute: AppRoutes): appRoute is EditCaseSectionRoute {
  return (<any>appRoute).action === CaseItemAction.Edit;
}

export function isRouteModal(route: AppRoutes): boolean {
  return isRouteWithModalSupport(route) && route.activeModal?.length > 0;
}

export type CSAMReportRoute = {
  route: 'csam-report';
  subroute: 'form' | 'loading' | 'status' | 'report-type-picker';
  previousRoute: AppRoutes;
};

type ContactCoreRoute = RouteWithContext & {
  route: 'contact';
  id: string;
  profileId?: Profile['id'];
};

type ContactViewRoute = ContactCoreRoute & {
  subroute: 'view';
};

export type ContactEditRoute = ContactCoreRoute & {
  subroute: 'edit';
  form: keyof Pick<ContactRawJson, 'childInformation' | 'callerInformation' | 'caseInformation' | 'categories'>;
};

type ContactRoute = ContactViewRoute | ContactEditRoute;

export const isContactRoute = (route: AppRoutes): route is ContactRoute => {
  return route.route === 'contact';
};

type OtherRoutes =
  | CSAMReportRoute
  | { route: 'select-call-type' }
  | TabbedFormRoute
  | SearchRoute
  | ContactRoute
  | CaseListRoute
  | ProfileListRoute
  | ProfileRoute
  | ProfileEditRoute
  | ProfileSectionEditRoute;

// The different routes we have in our app
export type AppRoutes = CaseRoute | ProfileHomeRoute | OtherRoutes;

export function isRouteWithModalSupport(appRoute: any): appRoute is RouteWithModalSupport {
  return ['tabbed-forms', 'case', 'case-list', 'contact', 'profile', 'search', 'select-call-type'].includes(
    appRoute.route,
  );
}

export const isCaseRoute = (route: AppRoutes): route is CaseRoute => route?.route === 'case';

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
