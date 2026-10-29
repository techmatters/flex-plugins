# Terragrunt Overview

## Overview

Review the [terragrunt quick start](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/) to get a basic understanding of how terragrunt works in very basic setups.

The first half of this document explains the generic Terragrunt mechanics we rely on (cache, working directory, generate blocks). The second half, [How this repo uses Terragrunt](#how-this-repo-uses-terragrunt), explains how those pieces fit together in `twilio-iac` and is the best place to start if you are new.

## Working Directory, Cache, and Generate Blocks

Terragrunt doesn't do anything fancy in Go to run terraform commands in the module defined in the terraform block. It manages files in a cache on the local filesystem and then runs terraform commands in a working directory within that cache. It uses the `generate` block to generate files in the working directory before running terraform commands.

### Working Directory and Cache

Terragrunt copies files around to build the cache. The cache can come from git or, as in our use case, from the local filesystem. When using local terraform modules as the terraform source, terragrunt copies the dir structure before the `//` in the `source` argument into a local cache. It then uses the directory within that new cache that is defined after the `//` as a working dir for running terraform commands and generating blocks.

For example, If you have a terraform block in your `terragrunt.hcl` like this:

```hcl
terraform {
  source = "../../terraform-modules//stages/provision"
}
```

The entire directory structure at `../../terraform-modules` will be copied into the local cache. Then the directory relative path `stages/provision` within that cache will be used as the working directory for terragrunt. Terragrunt will run terraform commands from within that directory.

So in this simple example, if we weren't doing some magic to make helpline/environment argument driven, the `.terragrunt-cache` in the provision stage would look something like this:

```bash
.
└── F2j4digM03aWTyKSKHYuNOEi6Co
    └── 7LayNgw6Eg_jwfqrjmlASLY2lss
        ├── aws
...
        ├── stages
        │   ├── configure
        │   ├── external-recordings
        │   ├── lex
        │   ├── provision
        │   └── system-down
...
        └── taskRouter
```

The working directory would be in the `stages/provision` directory.

In practice our make targets set `TERRAGRUNT_DOWNLOAD=".terragrunt-cache/<HL>/<HL_ENV>"`, so each helpline/environment gets its own cache directory inside the stage folder. `make clean` removes all local cache directories.

### Generate Blocks

Terragrunt uses the `generate` block to generate files in the working directory. It uses the `path` argument to determine where to put the generated file. It uses the `template` argument to determine what to put in the generated file. It uses the `if_exists` argument to determine what to do if the file already exists.

So, continuing the simple example above, if we had a generate block in our `terragrunt.hcl` like this:

```hcl
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  backend "s3" {
    bucket         = "tl-terraform-state-${local.environment}"
    key            = "twilio/${local.short_helpline}/${local.stage}/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    assume_role {
      role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-${local.environment}"
    }
  }
}
EOF
}
```

Then each time terragrunt runs, it will generate a `backend.tf` file in the `stages/provision` directory with the defined content. It will overwrite the file if it already exists.

Terragrunt will then run terraform commands in the `stages/provision` directory. Since all of the content in a directory is automatically included in the terraform plan, the `backend.tf` file will be included in the plan.

This very basic functionality allows us to use terragrunt to do many things to keep our terraform code DRY that aren't natively supported by terraform. Some of the same functionality can be achieved with terraform workspaces, but even terraform recommends that for long lived environments with massive changes, workspaces are [not the best solution](https://developer.hashicorp.com/terraform/cli/workspaces#when-not-to-use-multiple-workspaces).

## How this repo uses Terragrunt

### Directory layout

```text
twilio-iac/
├── helplines/                 # Configuration: one folder per helpline (see helplines/README.md)
│   ├── defaults.hcl           #   global defaults for every helpline
│   ├── <short_code>/          #   e.g. usnm, usch, ca
│   │   ├── common.hcl         #     values shared by all environments of this helpline
│   │   ├── staging.hcl        #     staging-only values
│   │   ├── production.hcl     #     production-only values
│   │   ├── configs/           #     service-configuration JSON, Lex V2 JSON
│   │   └── templates/         #     helpline-specific Studio flow / workflow templates
│   ├── templates/             #   shared Studio flow, workflow and channel-attribute templates
│   └── configs/               #   shared Lex V2 and service-configuration files
├── stages/                    # Terragrunt entry points: one folder per stage (see stages/README.md)
│   ├── terragrunt.root.hcl    #   shared logic included by every stage
│   └── <stage>/terragrunt.hcl
├── terraform-modules/         # Terraform code
│   ├── stages/<stage>/        #   the root module each stage runs
│   └── ...                    #   reusable modules (taskRouter, channels, studio-flows, lex, ...)
├── makefiles/                 # make targets (all commands run inside Docker)
└── scripts/                   # helper scripts (service configuration, secrets, pre-checks)
```

The rule of thumb: **`helplines/` is what you change, `terraform-modules/` is how it gets built, and `stages/` connects the two.**

### From configuration to a running stage

When you run `make HL=usnm HL_ENV=staging plan` inside `stages/configure`, this is what happens:

1. **Configuration is loaded.** `stages/terragrunt.root.hcl` reads `helplines/usnm/staging.hcl`. That file reads `common.hcl`, which in turn reads `defaults.hcl`. Each level is merged over the previous one with `merge()`: `defaults.hcl` → `common.hcl` → `staging.hcl`.
2. **Computed values are added**: `stage`, `environment`, `short_environment` (`STG`/`PROD`/`DEV`), `short_helpline`, `aws_account_id` and the `role_arn` the stage will assume.
3. **Files are generated** into the working directory (see the next section).
4. **The whole merged config is passed as inputs** (`inputs = local.config`) to the stage's root module in `terraform-modules/stages/<stage>`. Each stage only uses the inputs it declares as `variable` blocks; everything else is ignored.
5. **Terraform runs**, using a separate state file per helpline, environment and stage.
6. **After-hooks run** for some stages (for example `configure` runs `manageServiceConfig.py` after apply to push the Flex service configuration).

### Files generated for every stage

`stages/terragrunt.root.hcl` generates these files before each run:

| File | Source | Purpose |
|---|---|---|
| `backend.tf` | `stages/backend-remote.tftpl` | S3 state in `tl-terraform-state-<environment>`, key `twilio/<short_helpline>/<stage>/terraform.tfstate`, locked with the `terraform-locks` DynamoDB table. Also pins the Twilio and Datadog provider versions. |
| `aws-provider.tf` | `stages/aws-provider.tftpl` | The default AWS provider (`us-east-1`) and an aliased `hl-region` provider for the helpline's `helpline_region`, both assuming the stage's role. |
| `additional.tf` | `helplines/<short_code>/files/additional.<stage>.tf`, else `helplines/files/additional.<stage>.tf` | Escape hatch for one-off Terraform. Avoid it; see [helplines/files/README.md](../helplines/files/README.md). |

Setting `USE_LOCAL_STATE` switches the backend to local state (`stages/backend-local.tftpl`) and drops stage dependencies. This is only meant for state migrations.

### Stages

| Stage | What it manages | Depends on |
|---|---|---|
| `provision` | Resources that rarely change: TaskRouter workspace, queues, workflows, task channels, activities, serverless service, AWS resources, GitHub secrets | none |
| `system-down` | "System Down" and "Debug" Studio subflows (only used when `enable_system_down = true`) | `provision` |
| `configure` | Channels and their Studio flows, standalone Studio flows (post-call surveys), event subscriptions, Datadog monitors, HRM integration; then applies the Flex service configuration | `provision`, and `system-down` when enabled |
| `lex` | Amazon Lex V2 bots, intents, slots and slot types listed in `lex_v2_bot_languages` | none |
| `external-recordings` | IAM user and keys Twilio uses to upload recordings to S3 (only when `enable_external_recordings = true`). Runs with the `tf-admin` role. | `provision` |

For a new helpline apply them in this order: `provision` → `system-down` (if enabled) → `configure`, then `lex` and `external-recordings` as needed. More detail is in [stages/README.md](../stages/README.md).

### Running commands

All commands run inside the `public.ecr.aws/techmatters/terraform` Docker image through `make`. The repository is mounted at `/app` inside the container, which is why template paths in the helpline config are absolute container paths such as `/app/twilio-iac/helplines/usnm/templates/studio-flows/sms.tftpl`.

Before your first run:

- Install Docker and Make, and set the environment variables listed in the [twilio-iac README](../README.md) (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GITHUB_TOKEN`). Don't put secrets in your shell history.
- Create a Terraform provider cache directory at `~/terraform-provider-cache` or `/opt/terraform-provider-cache`, or point `TF_PLUGIN_CACHE_HOST` at one. The make targets stop with an error if none exists.

Then run from inside a stage folder, always passing the helpline short code and the environment:

```bash
cd twilio-iac/stages/configure
make HL=usnm HL_ENV=staging init
make HL=usnm HL_ENV=staging plan
make HL=usnm HL_ENV=staging apply
```

| Target | What it does |
|---|---|
| `init`, `plan`, `apply`, `destroy` | Run for the current stage only |
| `plan-all`, `apply-all`, `init-all` | Run for all stages below the current folder (`terragrunt run-all`). `apply-all` does not ask for confirmation, so use it for `plan` and `init` only. |
| `clean` | Delete the local `.terragrunt-cache` folders |
| `setup-new-environment` | First-time setup of a new helpline environment (run from `stages/provision`; see the twilio-iac README) |

`plan`, `apply` and `init` first run `scripts/verifyPreWork.sh` as a safety check. Extra Terragrunt/Terraform arguments can be passed with `tg_args`, e.g. `make HL=usnm HL_ENV=staging apply tg_args="-refresh-only"`.

### Gotchas for newcomers

- **Typos fail silently.** Any key in the helpline config that no stage declares as a variable is simply ignored, so a misspelled key does nothing and raises no error. Check the stage's `variables.tf` in `terraform-modules/stages/<stage>/` when adding a new key.
- **Merges are shallow.** If `staging.hcl` defines `flow_vars` or `channels`, it **replaces** the whole map from `common.hcl`. It is not merged key by key.
- **Put each value at the lowest level where it's true.** Use `common.hcl` for values shared by all environments, and the environment files only for what differs (SIDs, phone numbers, environment-specific copy).
- **`flow_vars` and `channel_flow_vars` only reach Studio flow templates.** Templates read them as `flow_vars.key` or `flow_vars["key"]` (sometimes split over several lines). A value no template reads has no effect.
- **Staging and production drift.** Environment files contain environment-specific SIDs, so they legitimately differ. When something works in staging but not in production, compare the two environment files first.
- **Flex service configuration is separate from Terraform.** Feature flags and other Flex settings live in `helplines/<short_code>/configs/service-configuration/*.json` and are applied by `manageServiceConfig.py`, not by Terraform variables. See [service_configuration.md](service_configuration.md).
- **`enable_*` flags are off by default.** `defaults.hcl` sets them to `false`; a feature is only on when a helpline turns it on explicitly.
