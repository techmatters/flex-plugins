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

import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { useEffect, useState } from 'react';
import ReplyIcon from '@material-ui/icons/Reply';
import ErrorIcon from '@material-ui/icons/Error';

import customContactComponentRegistry from '../../forms/customContactComponentRegistry';
import { RootState } from '../../../states';
import {
  ReferralLookupStatus,
  updateResourceReferralIdToAddForUnsavedContactAction,
  updateResourceReferralLookupStatusForUnsavedContactAction,
  addResourceReferralForUnsavedContactAction,
  removeResourceReferralForUnsavedContactAction,
} from '../../../states/contacts/resourceReferral';
import asyncDispatch from '../../../states/asyncDispatch';
import { loadResourceAsyncAction, ResourceLoadStatus } from '../../../states/resources';
import { ReferrableResource } from '../../../services/ResourceService';
import {
  Container,
  InputWrapper,
  InputText,
  AddButton,
  ReferralList,
  ReferralItem,
  ReferralItemInfo,
  Error,
  DeleteButton,
} from './styles';
import { contactFormsBase, namespace, referrableResourcesBase } from '../../../states/storeNamespaces';

type OwnProps = {
  contactId: string;
};

const mapStateToProps = (state: RootState, { contactId }: OwnProps) => {
  const {
    draftContact,
    metadata: {
      draft: {
        resourceReferralList: { lookupStatus, resourceReferralIdToAdd },
      },
    },
  } = state[namespace][contactFormsBase].existingContacts[contactId];
  const referrals = draftContact?.referrals ?? [];
  return {
    referrals: referrals ?? [],
    lookupStatus,
    resourceReferralIdToAdd,
    lookedUpResource: state[namespace][referrableResourcesBase].resources[resourceReferralIdToAdd],
  };
};

const mapDispatchToProps = (dispatch, { contactId }: OwnProps) => ({
  updateResourceReferralIdToAdd: (value: string) =>
    dispatch(updateResourceReferralIdToAddForUnsavedContactAction(contactId, value)),

  updateResourceReferralLookupStatus: (value: ReferralLookupStatus) =>
    dispatch(updateResourceReferralLookupStatusForUnsavedContactAction(contactId, value)),
  loadResource: (resourceId: string) => asyncDispatch(dispatch)(loadResourceAsyncAction(resourceId)),
  addResourceReferral: (resource: ReferrableResource) => {
    dispatch(addResourceReferralForUnsavedContactAction(contactId, resource));
  },

  updateResourceReferralIdToRemove: (value: string) => {
    dispatch(removeResourceReferralForUnsavedContactAction(contactId, value));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ResourceReferralList: React.FC<Props> = ({
  referrals,
  resourceReferralIdToAdd,
  lookedUpResource,
  updateResourceReferralIdToAdd,
  updateResourceReferralLookupStatus,
  loadResource,
  lookupStatus,
  addResourceReferral,
  updateResourceReferralIdToRemove,
}) => {
  // component state 'buffer' to keep the input responsive
  const [resourceReferralToAddText, setResourceReferralToAddText] = useState(resourceReferralIdToAdd);

  const checkResourceAndAddReferral = () => {
    updateResourceReferralIdToAdd(resourceReferralToAddText);
    updateResourceReferralLookupStatus(ReferralLookupStatus.PENDING);
  };

  const resourceReferralToAddInputChanged = (value: string) => {
    setResourceReferralToAddText(value);
    if (lookupStatus !== ReferralLookupStatus.NOT_STARTED) {
      updateResourceReferralLookupStatus(ReferralLookupStatus.NOT_STARTED);
    }
  };

  const handleRemoveReferral = (resourceId: string) => {
    updateResourceReferralIdToRemove(resourceId);
  };

  // To retain state if we change the task
  useEffect(() => {
    return () => {
      updateResourceReferralIdToAdd(resourceReferralToAddText);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lookedUpResource) {
      if (resourceReferralIdToAdd) {
        loadResource(resourceReferralIdToAdd);
      }
    } else if (lookupStatus === ReferralLookupStatus.PENDING) {
      if (lookedUpResource.status === ResourceLoadStatus.Error) {
        updateResourceReferralLookupStatus(ReferralLookupStatus.NOT_FOUND);
      } else if (lookedUpResource.status === ResourceLoadStatus.Loaded) {
        updateResourceReferralLookupStatus(ReferralLookupStatus.FOUND);
        addResourceReferral(lookedUpResource.resource);
        setResourceReferralToAddText('');
      }
    }
  }, [
    addResourceReferral,
    loadResource,
    lookedUpResource,
    lookupStatus,
    resourceReferralIdToAdd,
    updateResourceReferralLookupStatus,
  ]);

  return (
    <Container>
      <p>
        <Template code="Resources Shared:" />
      </p>
      <InputWrapper>
        <InputText
          type="text"
          onChange={e => resourceReferralToAddInputChanged(e.target.value)}
          value={resourceReferralToAddText}
          disabled={lookupStatus === ReferralLookupStatus.PENDING}
          data-testid="add-resource-input"
        />
        <AddButton
          type="submit"
          onClick={checkResourceAndAddReferral}
          disabled={lookupStatus === ReferralLookupStatus.PENDING || !resourceReferralToAddText}
          data-testid="add-resource-button"
        >
          <Template code="Forms-ResourceReferralsList-Add" />
        </AddButton>
      </InputWrapper>
      {lookupStatus === ReferralLookupStatus.NOT_FOUND && (
        <Error>
          <ErrorIcon style={{ fontSize: '18px', marginRight: '4px' }} />
          No match found for &lsquo;{resourceReferralIdToAdd}&rsquo;, try again
        </Error>
      )}
      <ReferralList>
        {referrals.map(({ resourceName, resourceId }) => (
          <ReferralItem key={resourceId} data-testid="added-resource-item">
            <ReplyIcon
              style={{
                transform: 'rotateY(180deg)',
                fontSize: '18px',
                color: '#192B33',
                marginRight: '5px',
              }}
            />
            <ReferralItemInfo>
              <span>{resourceName}</span>
              <span>ID #{resourceId}</span>
              <DeleteButton onClick={() => handleRemoveReferral(resourceId)}>
                <Template code="Forms-ResourceReferralsList-Delete" />
              </DeleteButton>
            </ReferralItemInfo>
          </ReferralItem>
        ))}
      </ReferralList>
    </Container>
  );
};

ResourceReferralList.displayName = 'ResourceReferralList';

const ConnectedResourceReferralList = connector(ResourceReferralList);

customContactComponentRegistry.register('resource-referral-list', parameters => {
  return <ConnectedResourceReferralList contactId={parameters.contactId} />;
});
