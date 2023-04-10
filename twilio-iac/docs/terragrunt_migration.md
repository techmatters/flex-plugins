# Terragrunt Migration

## Overview

This is a living document to attempt to capture the steps required to migrate from Terraform to Terragrunt. It will likely change significantly as we learn more about the process, but this is a start.

## Migration Steps

### Getting ready

Ensure that no one else is currently working on the helpline/stage you are about to migrate. If they are, you will need to coordinate with them to avoid conflicts. Once you start this process, if anyone runs an apply on the old Terraform configuration, you will need to start over with a fresh migration.

Add a check the `Locked` column in [terraform configuration tracking document](https://app.box.com/file/1109527438079).

### Setup new Helpline

Helpline configurations live in the [helplines](../helplines/README.md) directory.

The fist step is to copy the `twilio-iac/helplines/example` directory to a new directory named after the helpline's short code. Example: `twilio-iac/helplines/as`. This directory will contain the configuration for the helpline.

Next, the `common.hcl`, `staging.hcl`, and `production.hcl` files need to be updated to reflect the new helpline's configuration based on the old Terraform configuration. Those values may be in a `variables.tf` file or set as `locals` with `main.tf` depending on the helpline. You may not get all of the values correct on the first pass. Just make an effort to get the important ones and you'll refine them later.

### Run automated migration for each stage

Run `make HL=<short_code> HL_ENV=<environment> migrate-state` for each stage in order. (provision, chatbot, and then configure)

This will migrate secrets from the old format to the new format. It will also init the local environment for each stage. Then it will migrate the old terraform state to remove unnecessary resources for each state.

Start with the `provision` stage since it handles TF secrets migration which is required by all other stages. You don't have to wait for it to finish the state migration before moving on to the next stage. Just make sure it has started state migration before moving on to the next stage (you'll see "Successfully removed 1 resource instance(s)." messages). You will be asked several questions. The correct answer always the default value (press enter without typing anything) unless you are trying to fix something that went very wrong.

Answer "yes" to the final question that asks:

"Do you want to overwrite the state in the new backend with the previous state?
  Enter "yes" to copy and "no" to start with the existing state in the newly
  configured "s3" backend."

State migration could take a *very* long time. Like, a couple of hours. There are retry systems in place, but It *may* fail along the way. It can be safely restarted by running `make HL=<short_code> HL_ENV=<environment> migrate-state` again. It will pick up where it left off after asking you a few questions.

It is safe to run `make HL=<short_code> HL_ENV=<environment> migrate-state` repeatedly until you have run a full apply for a stage.

The `migrate-state` commands for each stage can be safely run in parallel. They will not conflict with each other. They are non-destructive to the running environment.

### Test/Fix plan for each stage

### Provision Stage

As soon as the `provision` stage has completed state migration, you can begin testing its plan by running `make HL=<short_code> HL_ENV=<environment> plan` from the `/twilio-iac/stages/provision` directory.

If the configuration of the helpline is correct, there should be no changes listed in the plan. There should only be somee new `outputs` added to the state.

Adjust the settings you have passed in in common.hcl, staging.hcl, and production.hcl until the plan is empty. You *may* also need to modify the underlying modules to get the plan to be empty. The goal is to have an empty plan.

If you want to test all of the stages before applying the changes, you can run `make HL=<short_code> HL_ENV=<environment> apply tg_args="-refresh-only"` to update the required outputs in the state without actually applying any changes. Then the next stage will be able to produce a plan without having changes actually applied.

Once the plan is empty, you can apply the changes with `make HL=<short_code> HL_ENV=<environment> apply` to update the outputs in the state for use by the next stages.


### Chatbot Stage

Once the `provision` stage is applies, you can begin testing the `chatbot` stage. Run `make HL=<short_code> HL_ENV=<environment> plan` from the `/twilio-iac/stages/chatbot` directory.

If you want to test all of the stages before applying the changes, you can run `make HL=<short_code> HL_ENV=<environment> apply tg_args="-refresh-only"` to update the required outputs in the state without actually applying any changes. Then the next stage will be able to produce a plan without having changes actually applied.

The goal is to have an empty plan that only updates the outputs in the state. You may need to modify the underlying modules to get the plan to be empty. Once the plan is empty, you can apply the changes with `make HL=<short_code> HL_ENV=<environment> apply` to update the outputs in the state for use by the next stages.

#### Autopilot Configuration

Autopilot is deprecated and will be replaced in the near future. The `default_autopilot_chatbot_enabled` config variable is set by default and will cause the default chatbot configuration to be applied optionally.

The chatbot stage also supports adding "custom" terraform files to the workspace using a the [files](../helplines/files/README.md) configuration. This is a temporary workaround until we migrate from autopilot to a new chatbot provider. Add files as needed there to get the chatbot plan to be empty.

Once the chatbot plan is empty, you can apply the changes with `make HL=<short_code> HL_ENV=<environment> apply` to update the outputs in the state for use by the next stages.

#### New Chatbot Configuration

// TODO: fill in more detail for when we start migrating away from autopilot.

### Configure Stage

The configure stage depends on outputs from both the provision and chatbot stages. Once both of those stages have been applied, you can begin testing the `configure` stage. Run `make HL=<short_code> HL_ENV=<environment> plan` from the `/twilio-iac/stages/configure` directory.

This stage will probably require many changes to the underlying modules and the configuration being passed in.

The goal is to have an empty plan that is completely configuration driven. You will need to modify the underlying modules to get the plan to be empty. Once the plan is empty, you can apply the changes with `make HL=<short_code> HL_ENV=<environment> apply`

## Cleaning up

Once all of the stages have been migrated, you can remove the old Terraform base directory at the top level of `twilio-iac` and update the [terraform configuration tracking document](https://app.box.com/file/1109527438079) with relevant information and be sure to check the "Migrated" and "Clean Apply" boxes. (you do have a clean apply, right?)
