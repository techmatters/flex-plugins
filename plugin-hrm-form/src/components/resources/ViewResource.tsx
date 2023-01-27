import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { namespace, referrableResourcesBase, RootState } from '../../states';
import { loadResource } from '../../states/resources/loadResource';
import { Flex } from '../../styles/HrmStyles';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import { ResourceTitle, ViewResourceArea } from '../../styles/ReferrableResources';

type OwnProps = {
  resourceId: string;
};

const mapStateToProps = (state: RootState, { resourceId }: OwnProps) => ({
  resource: state[namespace][referrableResourcesBase].resources[resourceId]?.resource,
  error: state[namespace][referrableResourcesBase].resources[resourceId]?.error,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>, { resourceId }: OwnProps) => ({
  loadViewedResource: () => loadResource(dispatch, resourceId),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ViewResource: React.FC<Props> = ({ resource, error, loadViewedResource }) => {
  if (!resource && !error) {
    loadViewedResource();
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Flex marginTop="15px" marginBottom="15px">
        {/* eslint-disable-next-line no-empty-function */}
        <SearchResultsBackButton text={<Template code="SearchResultsIndex-BackToResults" />} handleBack={() => {}} />
      </Flex>
      <ViewResourceArea>
        {error && ( // TODO: translation / friendlyisation layer
          <>
            <ResourceTitle>
              <Template code="Resources-LoadResourceError" />
            </ResourceTitle>
            <p>{error.message}</p>
          </>
        )}
        {resource && <ResourceTitle>{resource.name}</ResourceTitle>}
      </ViewResourceArea>
    </div>
  );
};

ViewResource.displayName = 'ViewResource';

export default connector(ViewResource);
