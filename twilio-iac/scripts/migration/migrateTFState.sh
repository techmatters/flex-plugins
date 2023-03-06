#!/usr/bin/env bash

environment=$1
short_helpline=$2
stage=$3

old_key="twilio/${short_helpline}/terraform.tfstate"
new_key_base="twilio/${short_helpline}/${stage}"
new_key="${new_key_base}/terraform.tfstate"
new_key_lock="${new_key_base}/migration.lock.json"

s3_bucket="tl-terraform-state-${environment}"

ssm_role_arn="arn:aws:iam::712893914485:role/tf-twilio-iac-${environment}"

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

printf "\n\n"

. ${script_dir}/../assumeStsRole.sh ${ssm_role_arn} migrateTFState

printf "Checking S3 bucket (${s3_bucket}) for ${old_key}, ${new_key}, and ${new_key_lock}..."
aws s3api head-object --bucket $s3_bucket --key $old_key >> /dev/null 2>&1
old_key_exists=$?

aws s3api head-object --bucket $s3_bucket --key $new_key >> /dev/null 2>&1
new_key_exists=$?

aws s3api head-object --bucket $s3_bucket --key $new_key_lock >> /dev/null 2>&1
new_key_lock_exists=$?
printf "Done!\n\n"

if [ $old_key_exists -eq 0 ] && [ $new_key_exists -ne 0 ]; then
  printf "Copying state in ${s3_bucket} from ${old_key} to ${new_key}..."
  aws s3 cp \
    s3://${s3_bucket}/${old_key} \
    s3://${s3_bucket}/${new_key}
fi

if [ $new_key_lock_exists -ne 0 ]; then
  . ${script_dir}/migrateTFState-${stage}.sh

  printf "Creating lock file in ${s3_bucket} at ${new_key_lock}..."
  aws s3 cp \
    ${script_dir}/migration.lock.json \
    s3://${s3_bucket}/${new_key_lock}
  printf "Done!\n\n"
fi

echo "Done!"
