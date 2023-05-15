import { logInfo } from '../helpers/log';
import { setIsDryRun, useTerraform, useTerragrunt } from './execTerraform';
import { setEnvFromSsm } from './setEnvFromSsm';

/**
 * This function sets up the terraformExec system based on global args to support
 * both terraform and terragrunt commands.
 *
 * @param argv
 * @returns void
 */
export const handleTerraformArgs = async (argv: any) => {
  // We add a hidden `requireTerraform` arg all commands that depend on terraform
  // so if it's not present, we can skip this setup.
  if (!Object.prototype.hasOwnProperty.call(argv, 'requireTerraform')) return;

  if (argv.dryRun) {
    logInfo('================== DRY RUN ==================');
    logInfo('No imports will be performed, command outputs are what would have been run.');
    setIsDryRun();
  }

  // We depend on checkArgv to ensure that if stage is provided, helpline, helplineEnvironment,
  // and stage are all provided and that this is a terragrunt run.
  if (argv.stage) {
    const { helplineShortCode, helplineEnvironment, stage } = argv;
    useTerragrunt({
      helplineShortCode,
      helplineEnvironment,
      stage,
    });
    await setEnvFromSsm(`${helplineEnvironment}/${helplineShortCode}`);
    return;
  }

  const { helplineDirectory, varFile } = argv;
  useTerraform({ helplineDirectory, varFile });
  await setEnvFromSsm(helplineDirectory);
};
