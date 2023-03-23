#!/usr/bin/env bash

environment=$1
short_helpline=$2
stage=$3

echo "Migrating Terraform state for ${short_helpline} in ${environment} to ${stage}"

old_key="twilio/${short_helpline}/terraform.tfstate"
new_key_base="twilio/${short_helpline}/${stage}"
new_key="${new_key_base}/terraform.tfstate"
new_key_lock="${new_key_base}/migration.lock.json"
local_state_file="${short_helpline}-${environment}.tfstate"

s3_bucket="tl-terraform-state-${environment}"

ssm_role_arn="arn:aws:iam::712893914485:role/tf-twilio-iac-${environment}"

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

printf "\n\n"

. ${script_dir}/../../assumeStsRole.sh ${ssm_role_arn} migrateTFState

printf "Checking S3 bucket (${s3_bucket}) for ${old_key}, ${new_key}, and ${new_key_lock}..."
aws s3api head-object --bucket $s3_bucket --key $old_key >> /dev/null 2>&1
old_key_exists=$?

aws s3api head-object --bucket $s3_bucket --key $new_key >> /dev/null 2>&1
new_key_exists=$?

aws s3api head-object --bucket $s3_bucket --key $new_key_lock >> /dev/null 2>&1
new_key_lock_exists=$?

printf "Done!\n\n"

if [ $new_key_exists -eq 0 ]; then
  read -p "${new_key} already exists in ${s3_bucket}. Continuing may overwrite it. Are you sure you want to do this? (y/N)" -n 1 -r
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  else
    printf "\nok. Continuing...\n\n"
  fi
fi

function copyOldStateToLocal {
  printf "Copying state in ${s3_bucket} from ${old_key} to ${local_state_file}..."
  aws s3 cp \
    s3://${s3_bucket}/${old_key} \
    $local_state_file
  printf "Done!\n\n"
}

if [ $old_key_exists -eq 0 ]; then
  if [ -f "$local_state_file" ]; then
    read -p "${local_state_file} already exists. Do you want to overwrite it?(y/N)" -n 1 -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      copyOldStateToLocal
    fi
  else
    copyOldStateToLocal
  fi
else
  echo "${old_key_exists} doesn't exist in ${s3_bucket}"
  exit 1
fi
