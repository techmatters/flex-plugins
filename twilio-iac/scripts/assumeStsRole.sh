#!/usr/bin/env bash

ssm_role_arn=$1
session_prefix=$2

# Default to 1 hour, but allow override
# session_duration this is limited to 1 hour (3600 seconds) if you are using role chaining (multiple assume-role calls)
# or 12 hours (43200 seconds) if you are using a single assume-role call.
session_duration="${3:-3600}"

printf "Assuming role ${ssm_role_arn}..."
ts=$(date +%s)
OUT=$(aws sts assume-role --role-arn ${ssm_role_arn} --role-session-name ${session_prefix}-${ts} --duration-seconds ${session_duration})
export AWS_ACCESS_KEY_ID=$(echo $OUT | jq -r '.Credentials''.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $OUT | jq -r '.Credentials''.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $OUT | jq -r '.Credentials''.SessionToken')
printf "Done!\n\n"
