import ViewResource from './ViewResource';
import { namespace, referrableResourcesBase, RootState } from '../../states';
import { connect } from 'react-redux';
import { ResourcePage } from '../../states/resources';

const mapStateToProps = (state: RootState) => ({
  route: state[namespace][referrableResourcesBase].route,
});

const connector = connect(mapStateToProps);

type Props = ReturnType<typeof mapStateToProps>

const ReferrableResources: React.FC<Props> = ({ route }) => {

  switch (route.page) {
    case ResourcePage.ViewResource: {
      return <ViewResource resourceId={route.id}/>;
    }
    default: {
      return <div>Page '{route.page}' not implemented.</div>
    }
  }

};

ReferrableResources.displayName = 'ReferrableResources';

export default connector(ReferrableResources);