import { RootState } from '..';
import { namespace } from '../storeNamespaces';

const selectCounselorsHash = (state: RootState) => state[namespace].configuration.counselors.hash;

export default selectCounselorsHash;
