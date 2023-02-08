#!/usr/bin/env bash

environment=$1
helpline=$2

environments=(development staging production)

declare -A short_env_map
short_env_map[dev]=development
short_env_map[stg]=staging
short_env_map[prod]=production

# Convert environment to lowercase
environment="${environment,,}"

# If the environment is a short name, convert it to the full name
[ "${short_env_map[${environment}]+yes}" ] && env=${short_env_map[$environment]}

if [[ ! " ${environments[@]} " =~ " ${environment} " ]]; then
    echo "${environment} is not a valid environment. It must be one of: ${environments[@]}"
    exit 1
fi

# Convert helpline to lowercase
helpine="${helpline,,}"

path="form-definitions/${helpline}"
helpline_dir="./hrm-form-definitions/${path}"

if [ ! -d "$helpline_dir" ]; then
  echo "${helpline} is not a valid helpline. It must be one of: $(ls ./hrm-form-definitions/form-definitions)"
fi

echo "environment=${environment}" >> $GITHUB_ENV
echo "short_helpline=${helpline}" >> $GITHUB_ENV
echo "s3_bucket=assets-${environment}.tl.techmatters.org" >> $GITHUB_ENV
echo "path=${path}" >> $GITHUB_ENV
echo "helpline_dir=${helpline_dir}" >> $GITHUB_ENV
