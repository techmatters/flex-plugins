import { environment } from 'getEnvironment';
import { helpline } from 'getHelpline';

const baseConfig = require(`../helplines/${helpline}/base.json`);
const envConfig  = require(`../helplines/${helpline}/${environment}/provision.json`);

const config = {
    ...baseConfig,
    ...envConfig,
}

console.log(JSON.stringify(config))
