import { AnyAction } from 'redux';
import { Dispatch } from 'react';

import { getResource } from '../../services/ResourceService';
import { addResourceAction, loadResourceErrorAction } from '.';

/**
 * Utility function that gets a resource from the service and loads it into redux
 * @param dispatch
 * @param id
 */
export const loadResource = async (dispatch: Dispatch<AnyAction>, id: string): Promise<void> => {
  try {
    const resource = await getResource(id);
    dispatch(addResourceAction(resource));
  } catch (err) {
    dispatch(loadResourceErrorAction(id, err));
  }
};
