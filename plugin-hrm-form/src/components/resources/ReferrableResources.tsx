import React from 'react';
import { connect } from 'react-redux';

import ViewResource from './ViewResource';
import { namespace, referrableResourcesBase, RootState } from '../../states';
import { ResourcePage } from '../../states/resources';
import { ReferrableResourcesContainer } from '../../styles/ReferrableResources';
import SearchResources from './SearchResources';

const mapStateToProps = (state: RootState) => ({
  route: state[namespace][referrableResourcesBase].route,
});

const connector = connect(mapStateToProps);

type Props = ReturnType<typeof mapStateToProps>;

const ReferrableResources: React.FC<Props> = ({ route }) => {
  switch (route.page) {
    case ResourcePage.Search: {
      return (
        <ReferrableResourcesContainer>
          <SearchResources />
        </ReferrableResourcesContainer>
      );
    }
    case ResourcePage.ViewResource: {
      return (
        <ReferrableResourcesContainer>
          <ViewResource resourceId={route.id} />
        </ReferrableResourcesContainer>
      );
    }
    default:
      return <div>Page &lsquo;{(route as any).page}&rsquo; not implemented.</div>;
  }
};

ReferrableResources.displayName = 'ReferrableResources';

export default connector(ReferrableResources);
