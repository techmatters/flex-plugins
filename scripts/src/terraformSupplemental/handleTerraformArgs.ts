import { logInfo } from '../helpers/log';
import { isDryRun, useTerraform, useTerragrunt } from './execTerraform';
import { setEnvFromSsm } from './setEnvFromSsm';

export const handleTerraformArgs = async (argv: any) => {
  if (!Object.prototype.hasOwnProperty.call(argv, 'requireTerraform')) return;

  if (argv.dryRun) {
    logInfo('================== DRY RUN ==================');
    logInfo('No imports will be performed, command outputs are what would have been run.');
    isDryRun();
  }

  // We depend on checkArgv to ensure that if stage is provided, helpline, helplineEnvironment,
  // and stage are all provided and that this is a terragrunt run.
  if (argv.stage) {
    const { helpline, helplineEnvironment, stage } = argv;
    useTerragrunt({
      helpline,
      helplineEnvironment,
      stage,
    });
    await setEnvFromSsm(`${helplineEnvironment}/${helpline}`);
    return;
  }

  useTerraform(argv.helplineDirectory);
  await setEnvFromSsm(argv.helplineDirectory);
};
