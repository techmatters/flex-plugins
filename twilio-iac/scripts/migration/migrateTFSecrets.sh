#!/usr/bin/env bash

old_dir_name=$1
environment=$2
short_helpline=$3

if [ ! -z ${PROVISION_SKIP_MIGRATION+x} ]; then
  echo "Skipping secrets migration because PROVISION_SKIP_MIGRATION is set"
  exit 0
fi

old_key="/terraform/twilio-iac/${old_dir_name}/secrets.json"
new_key="/terraform/twilio-iac/${environment}/${short_helpline}/secrets.json"

ssm_role_arn="arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-admin"

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

printf "\n\n"

. ${script_dir}/../assumeStsRole.sh ${ssm_role_arn} migrateTFSecrets

printf "Checking SSM parameters for ${old_key} and ${new_key}..."
aws ssm get-parameter --name $old_key >> /dev/null 2>&1
old_key_exists=$?

aws ssm get-parameter --name $new_key >> /dev/null 2>&1
new_key_exists=$?
printf "Done!\n\n"

if [ $old_key_exists -eq 0 ] && [ $new_key_exists -ne 0 ]; then
  printf "Migrating secrets from ${old_key} to ${new_key}..."
  aws ssm put-parameter \
    --name "${new_key}" \
    --type SecureString \
    --value "$(aws ssm get-parameter --name $old_key --with-decryption --query Parameter.Value --output text)" \
    --tags Key=Environment,Value=${environment} Key=Helpline,Value=${short_helpline}
  printf "Done!\n\n"
fi

if [ $old_key_exists -eq 0 ]; then
  read -p "The old key (${old_key}) still exists. Do you want to delete it?(y/N)" -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting old secrets from ${old_key}"
    # aws ssm delete-parameter --name $old_key
  fi
fi

echo "Done!"
