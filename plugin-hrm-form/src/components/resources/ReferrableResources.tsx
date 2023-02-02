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
import { connect } from 'react-redux';

import ViewResource from './ViewResource';
import { namespace, referrableResourcesBase, RootState } from '../../states';
import { ResourcePage } from '../../states/resources';
import { ReferrableResourcesContainer } from '../../styles/ReferrableResources';

const mapStateToProps = (state: RootState) => ({
  route: state[namespace][referrableResourcesBase].route,
});

const connector = connect(mapStateToProps);

type Props = ReturnType<typeof mapStateToProps>;

const ReferrableResources: React.FC<Props> = ({ route }) => {
  if (route.page === ResourcePage.ViewResource) {
    return (
      <ReferrableResourcesContainer>
        <ViewResource resourceId={route.id} />
      </ReferrableResourcesContainer>
    );
  }
  return <div>Page &lsquo;{route.page}&rsquo; not implemented.</div>;
};

ReferrableResources.displayName = 'ReferrableResources';

export default connector(ReferrableResources);
