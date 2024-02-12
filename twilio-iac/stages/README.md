# stages for terragrunt based infrastructure management

## Overview

This is the primary directory structure for running terragrunt. Each directory is a stage, and each stage has a `terragrunt.hcl` file that defines the configuration for that stage. The `terragrunt.hcl` file is the primary configuration file for terragrunt, and is used to define what each stage should run via terraform and stage specific configuration.

The terragrunt.hcl includes `./terragrunt.root.hcl` which handles shared configuration and preparation for each stage. This includes setting the backend and parsing the helpline configuration.

## Quick Start

### Single Stage

To run a terraform command for a single stage, navigate into the stage directory use the makesystem to run the command. Specify the helpline short code (`HL`) and the environment (`HL_ENV`) when you run the command.

example plan action for the aselo helpline in the production environment:

```bash

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

### `provision`

This is the initial stage and is used to provision resources that will rarely, if ever, change for a helpline.

### `chatbot`

Chatbot configuration is complicated enough to require its own stage. This stage depends on the `provision` stage and is used to configure the chatbot and its resources.

### `configure`

This stage manages often changed configuration for a helpline. It depends on the `provision` and `chatbot` stages.
