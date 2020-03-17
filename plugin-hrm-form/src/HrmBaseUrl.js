import { Manager } from '@twilio/flex-ui';

const hrmBaseUrl = Manager.getInstance().serviceConfiguration.attributes.hrm_base_url;
export default hrmBaseUrl;
