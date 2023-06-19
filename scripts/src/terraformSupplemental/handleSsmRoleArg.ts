import { setRoleToAssume } from '../helpers/ssm';
import { logDebug } from '../helpers/log';

export const handleSsmRoleArg = (argv: any) => {
  logDebug('handleSsmRoleArg: ', argv.ssmRole);
  if (argv.ssmRole) {
    setRoleToAssume(argv.ssmRole);
  }
};
