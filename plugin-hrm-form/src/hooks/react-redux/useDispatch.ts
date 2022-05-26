import { Manager } from '@twilio/flex-ui';

const useDispatch = () => {
  const { store } = Manager.getInstance();
  const { dispatch } = store;

  return dispatch;
};

export default useDispatch;
