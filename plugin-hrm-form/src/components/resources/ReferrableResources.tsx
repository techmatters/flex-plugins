import React from 'react';
import { connect } from 'react-redux';

import ViewResource from './ViewResource';
import { namespace, referrableResourcesBase, RootState } from '../../states';
import { ResourcePage } from '../../states/resources';

const mapStateToProps = (state: RootState) => ({
  route: state[namespace][referrableResourcesBase].route,
});

const connector = connect(mapStateToProps);

type Props = ReturnType<typeof mapStateToProps>;

const ReferrableResources: React.FC<Props> = ({ route }) => {
  if (route.page === ResourcePage.ViewResource) {
    return <ViewResource resourceId={route.id} />;
  }
  return <div>Page &lsquo;{route.page}&rsquo; not implemented.</div>;
};

ReferrableResources.displayName = 'ReferrableResources';

export default connector(ReferrableResources);
