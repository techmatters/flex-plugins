/* eslint-disable react/jsx-max-depth */
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';
import PhoneIcon from '@material-ui/icons/Phone';

import { namespace, referrableResourcesBase, RootState } from '../../states';
import { loadResource } from '../../states/resources/loadResource';
import { Box, Column, Row } from '../../styles/HrmStyles';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
} from '../../styles/ReferrableResources';
import ResourceAttribute from './ResourceAttribute';

type OwnProps = {
  resourceId: string;
};

const mapStateToProps = (state: RootState, { resourceId }: OwnProps) => ({
  resource: state[namespace][referrableResourcesBase].resources[resourceId]?.resource,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>, { resourceId }: OwnProps) => ({
  loadViewedResource: () => loadResource(dispatch, resourceId),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ViewResource: React.FC<Props> = ({ resource, loadViewedResource }) => {
  if (!resource) {
    loadViewedResource();
    return <div>Loading...</div>;
  }

  const { id, name, attributes } = resource;

  return (
    <Column>
      <Box marginTop="10px" marginBottom="10px">
        <SearchResultsBackButton
          text={<Template code="SearchResultsIndex-BackToResults" />}
          // eslint-disable-next-line no-empty-function
          handleBack={() => {}}
        />
      </Box>
      <ViewResourceArea>
        <ResourceTitle>{name}</ResourceTitle>
        <ResourceAttributesContainer>
          <ResourceAttributesColumn>
            <ResourceAttribute description="Details" content={attributes.Details} />
            <ResourceAttribute description="Fee" content={attributes.Fee} />
            <ResourceAttribute description="Application Process" content={attributes['Application Process']} />
            <ResourceAttribute description="Accessibility" content={attributes.Accessibility} />
            <ResourceAttribute description="Special Needs" content={attributes['Special Needs']} />
          </ResourceAttributesColumn>
          <ResourceAttributesColumn>
            <ResourceAttribute
              description="Contact Info"
              content={
                <>
                  <PhoneIcon fontSize="inherit" style={{ color: '#616C864D', marginRight: 5, marginBottom: -2 }} />
                  {attributes.Phone}
                  {' | '}
                  {attributes.Address}
                </>
              }
            />
            <ResourceAttribute description="Service Categories" content={attributes['Service Categories']} />
            <ResourceAttribute description="Hours" content={attributes.Hours} />
            <ResourceAttribute description="Ages Served" content={attributes['Ages Served']} />
          </ResourceAttributesColumn>
        </ResourceAttributesContainer>
      </ViewResourceArea>
    </Column>
  );
};

ViewResource.displayName = 'ViewResource';

export default connector(ViewResource);
