# stages for terragrunt based infrastructure management

## Overview

This is the primary directory structure for running terragrunt. Each directory is a stage, and each stage has a `terragrunt.hcl` file that defines the configuration for that stage. The `terragrunt.hcl` file is the primary configuration file for terragrunt, and is used to define what each stage should run via terraform and stage specific configuration.

The terragrunt.hcl includes `./terragrunt.root.hcl` which handles shared configuration and preparation for each stage. This includes setting the backend and parsing the helpline configuration.

## Quick Start

### Single Stage

To run a terraform command for a single stage, navigate into the stage directory use the makesystem to run the command. Specify the helpline short code (`HL`) and the environment (`HL_ENV`) when you run the command.

example plan action for the aselo helpline in the production environment:

```bash
make HL=as HL_ENV=production plan
```

### All Stages

Running all stages will not prompt for confirmation on apply. You should generally only use it for plan and init.

example plan-all action for the aselop helpline in the production environment:

```bash
make HL=as HL_ENV=production plan-all
```

## Stages

Stages are applied in this order for a new helpline: `provision` → `system-down` (if enabled) → `configure`. The `lex` and `external-recordings` stages can be run independently once `provision` exists.

### `provision`

This is the initial stage and is used to provision resources that will rarely, if ever, change for a helpline, such as TaskRouter (workspace, task queues, workflows, task channels, activities), the serverless service, AWS resources and GitHub secrets.

### `system-down`

Creates the "System Down" and "Debug" Studio subflows that channel flows call when the Aselo backend is unavailable or when debugging. It depends on the `provision` stage.

Only needed when `enable_system_down = true`. In that case the `configure` stage reads this stage's outputs (from its remote state), so `system-down` must be applied before `configure`.

### `configure`

This stage manages often changed configuration for a helpline: channels and their Studio flows, standalone Studio flows (such as post-call surveys), event subscriptions, Datadog monitors and the HRM service integration. It depends on the `provision` stage, and on `system-down` when `enable_system_down = true`.

After apply, it also runs `manageServiceConfig.py` to apply the helpline's Flex service configuration from `helplines/<short_code>/configs/service-configuration/`.

### `lex`

Creates the Amazon Lex V2 bots, intents, slots and slot types listed in `lex_v2_bot_languages`. It has no stage dependencies. See [lex/README.md](lex/README.md) for how the bot, intent, slot and slot type JSON files are looked up.

### `external-recordings`

Creates the IAM user and keys Twilio uses to upload external recordings to S3. Only creates resources when `enable_external_recordings = true`. It depends on the `provision` stage.

Unlike the other stages, it runs with the `tf-admin` role rather than the environment role, because it manages IAM users. See [external-recordings/README.md](external-recordings/README.md) for details.
