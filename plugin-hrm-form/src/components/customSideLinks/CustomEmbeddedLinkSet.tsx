/**
 * Copyright (C) 2021-2025 Technology Matters
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
import { useSelector } from 'react-redux';
import { Manager } from '@twilio/flex-ui';

import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { standaloneTaskSid } from '../../types/types';
import { RootState } from '../../states';
import { selectCurrentDefinitionVersion } from '../../states/configuration/selectDefinitions';

type Props = {};

const CustomEmbeddedLinkSet: React.FC<Props> = () => {
  const currentRoute = useSelector((s: RootState) => selectCurrentTopmostRouteForTask(s, standaloneTaskSid));
  const definitionVersion = useSelector(selectCurrentDefinitionVersion);
  const { strings } = Manager.getInstance();
  if (currentRoute?.route !== 'custom-link' || !currentRoute?.subroute || currentRoute.subroute === 'custom-link')
    return null;
  const linkDefinition = definitionVersion?.customLinks?.find(({ url }) => url === currentRoute.subroute);
  let title = currentRoute.subroute;
  if (linkDefinition?.label) {
    title = strings[linkDefinition.label] ?? linkDefinition.label;
  }
  return <iframe src={currentRoute.subroute} style={{ width: '100%', height: '100%' }} title={title} />;
};

export default CustomEmbeddedLinkSet;
