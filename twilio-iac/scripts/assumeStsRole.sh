#!/usr/bin/env bash

ssm_role_arn=$1
session_prefix=$2

printf "Assuming role ${ssm_role_arn}..."
ts=$(date +%s)
OUT=$(aws sts assume-role --role-arn ${ssm_role_arn} --role-session-name ${session_prefix}-${ts})
export AWS_ACCESS_KEY_ID=$(echo $OUT | jq -r '.Credentials''.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $OUT | jq -r '.Credentials''.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $OUT | jq -r '.Credentials''.SessionToken')
printf "Done!\n\n"