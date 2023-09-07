# Twilio Service Configuration Manager

## Requirements

See requirements in [twilio-iac/README.md](../README.md)

If at some point you run into an error inside the container, you can try pulling the latest docker image by running
`docker pull public.ecr.aws/techmatters/terraform:x.y.z` where x.y.z is the docker image defined in `/home/buonapasta/Desktop/TechMatters/flex-plugins/twilio-iac/makefiles/00-setup.make`.


## Usage

All make commands are run from the `twilio-iac` directory.

### Targeting a Helpline and/or An Environment via Environment Variables

These env vars are optional. If they are not set, the commands will run against ALL helplines in ALL environemnts.

`HL` - the helpline short code (lowercase)

`HL_ENV` - the environment (lowercase) - one of `development`, `staging`, or `production`


### Service Configuration Management Commands

These commands are used to manage the service configuration for a helpline.

`make service-config-plan` - outputs a plan for the service configuration update

`make service-config-apply` - applies the service configuration update

### Remote Sync Commands

These commands are used to update the local json config files based on the remote service configuration to ensure that the local config is up to date when changes have been made outside of the service configuration manager.

*Note: these commands do not accept an HL_ENV argument as they must load the configurations for all environments in order to compare them.*

`make service-config-sync-plan` - outputs a plan for the service configuration sync

`make service-config-sync-apply` - applies the service configuration sync

### Get Remote Service Configuration

In addition to the normal `HL` and `HL_ENV` targeting ENV vars, this command can be configured by setting the `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` environment variables for a helpline sot that it can be used by users who do not have access to production SSM parameters. Care should be taken to avoid saving the `TWILIO_AUTH_TOKEN` to the bash/zsh history. Reach out to a developer for suggestions on how to do this. You should *not* run it like this `TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx make service-config-show-remote` as this will save the token to the bash/zsh history in plain text.

`make service-config-show` - dumps the remote service configuration, the local service configuration, the new service configuration and the diff between the two to the terminal.

### Other Commands

`make service-config-show-remote` - dumps the remote service configuration to the terminal.

`make service-config-unlock` - removes lock if something went wrong and the lock is stuck.

## JSON Config Files

The helpline specific configuration is managed primarily via a cascading set of json config files. These files are stored in the `twilio-iac/helplines` directory.

The order of precedence for configuration file override relative to the `twilio-iac/helplines` directory is as follows:

`configs/service-configuration/defaults.json` - the default configuration for all helplines

`<helpline_short_code>/configs/service-configuration/common.json` - the common configuration for a specific helpline

`configs/<helpline_short_code>/configs/service-configuration/<environment>.json` - the environment specific configuration for a specific helpline

The `defaults.json`, `common.json` and `<environment>.json` files are merged together to create the final configuration for a helpline in a given environment.
