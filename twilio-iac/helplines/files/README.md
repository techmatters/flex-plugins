# Additional files used as source for helpline specific terraform code

## Background Knowledge

To understand how this works, you need to have a basic understand of how terragrunt and generate blocks work. Definitely review the [terragrunt overview](./terragrunt.md) before continuing.

## Overview

This is a dirty hack and should only be used as a stopgap until modules can be rewritten to be more properly managed by configuration only.

This system is a temporary band-aid to allow us to add additional terraform resources to the workspace. This is a temporary workaround until we migrate from autopilot to a new chatbot provider. Whenever possible the additional TF should be avoided in favor of configuration driven modules.

Sometimes helplines need additional terraform that is outside of the main stage module because of previous configuration using those resources. If you create a file relative to the helpline configuration directory with the path `./{short_code}/files/additional.{stage}.tf`, it will be copied into the module workspace before plan/apply. This allows you to add additional one-off resources to the workspace without having to modify the module itself.

The defaults in this directory are what is included if the helpline doesn't have any additional terraform. This allows standardization of locals and output.
