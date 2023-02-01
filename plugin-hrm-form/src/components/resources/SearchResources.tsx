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
