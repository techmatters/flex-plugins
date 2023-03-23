#!/usr/bin/env bash

# This is a very rudimentary system to migrate the state from the old Terraform state new state files
# for each stage that only have the resources for that stage.
#
# The state migration is subtractive only, meaning that we copy the old state file, and then remove
# resources for each stage from it.
#
# We copy the old remote state file to the local file system and handle all state migration locally
# to speed things up and elliminate slow networking issues.
#
# Once the local state is migrated, we copy it back to the remote state file.

environment=$1
short_helpline=$2
stage=$3

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# copy old state called in its own ENV so that assume role doesn't propgate up to this script
echo "running ${script_dir}/copyOldState.sh ${environment} ${short_helpline} ${stage}"
${script_dir}/copyOldState.sh ${environment} ${short_helpline} ${stage}

# This handles the local state migration and is stage specific
echo "running . ${script_dir}/stage-${stage}.sh"
. ${script_dir}/stage-${stage}.sh

# Once we get here, we assume that the local state file has been migrated and is ready to be migrated
# to the new remote state file
USE_LOCAL_STATE="" terragrunt init -migrate-state

echo "Done!"
