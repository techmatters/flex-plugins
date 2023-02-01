import { Dispatch } from 'react';
import { AnyAction } from 'redux-promise-middleware-actions/lib/actions';

/**
 * Wraps a regular dispatcher in a try ... catch so that rejections are only routed to the '_REJECTED' action handler.
 * This is rather than also being passed up the stack as an unhandled exception, which is the default behaviour of react-promise-middleware
 * @param innerDispatch - the dispatch function to wrap
 */
const asyncDispatch = <T extends AnyAction>(innerDispatch: Dispatch<T>) => async (action: T) => {
  try {
    await innerDispatch(action);
  } catch (err) {
    console.debug(`Rejected promise being handled by ${action.type}_REJECTED:`, err);
  }
};

export default asyncDispatch;
