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
import { connect, ConnectedProps } from 'react-redux';

import { namespace, referrableResourcesBase, RootState } from '../../states';
import { ResourceSearchStatus } from '../../states/resources/search';
import SearchResourcesForm from './SearchResourcesForm';
import SearchResourcesResults from './SearchResourcesResults';

type OwnProps = {};

const mapStateToProps = (state: RootState) => {
  const { status } = state[namespace][referrableResourcesBase].search;
  return {
    status,
  };
};

const connector = connect(mapStateToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const SearchResources: React.FC<Props> = ({ status }) => {
  switch (status) {
    case ResourceSearchStatus.NotSearched:
      return <SearchResourcesForm />;
    case ResourceSearchStatus.ResultPending:
      return <div>Loading...</div>;
    case ResourceSearchStatus.ResultReceived:
    case ResourceSearchStatus.Error:
      return <SearchResourcesResults />;
    default:
      return <div>Search state &lsquo;{status}&rsquo; not implemented.</div>;
  }
};

SearchResources.displayName = 'ViewResource';

export default connector(SearchResources);
