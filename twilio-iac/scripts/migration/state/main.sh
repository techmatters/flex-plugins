#!/usr/bin/env bash

environment=$1
short_helpline=$2
stage=$3

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# copy old state called in its own ENV so that assume role doesn't propgate up to this script
echo "running ${script_dir}/copyOldState.sh ${environment} ${short_helpline} ${stage}"
${script_dir}/copyOldState.sh ${environment} ${short_helpline} ${stage}

echo "running . ${script_dir}/stage-${stage}.sh"
. ${script_dir}/stage-${stage}.sh

USE_LOCAL_STATE="" terragrunt init -migrate-state

echo "Done!"
