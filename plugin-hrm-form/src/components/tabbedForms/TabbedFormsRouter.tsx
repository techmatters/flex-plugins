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

import React from 'react';

import { AppRoutes } from '../../states/routing/types';
import Router, { RouteConfig, shouldHandleRoute } from '../router/Router';
import useTabbedForm from './hooks/useTabbedForm';
import TabbedFormsCase from './TabbedFormsCase';
import TabbedFormsContact from './TabbedFormsContact';
import TabbedFormsTabs from './TabbedFormsTabs';
import TabbedFormsSearch from './TabbedFormsSearch';
import { TabbedFormsCommonProps } from './types';

type Props = TabbedFormsCommonProps;

const TABBED_FORMS_ROUTES: RouteConfig<Props> = [
  {
    routes: ['tabbed-forms'],
    renderComponent: (props: Props) => <TabbedFormsTabs {...props} />,
  },
  {
    routes: ['contact'],
    renderComponent: (props: Props) => <TabbedFormsContact {...props} />,
  },
  {
    routes: ['case'],
    renderComponent: (props: Props) => <TabbedFormsCase {...props} />,
  },
  {
    routes: ['search'],
    renderComponent: (props: Props) => <TabbedFormsSearch {...props} />,
  },
];

export const isTabbedFormsRoute = (routing: AppRoutes) => shouldHandleRoute(routing, TABBED_FORMS_ROUTES);

const TabbedFormsRouter: React.FC<Props> = props => {
  const { methods, FormProvider } = useTabbedForm();

  return (
    <FormProvider {...methods}>
      <Router {...props} routeConfig={TABBED_FORMS_ROUTES} />
    </FormProvider>
  );
};

export default TabbedFormsRouter;
