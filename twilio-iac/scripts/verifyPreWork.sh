#!/usr/bin/env bash

hl_or_dir=$1
environment=$2
stage=$3

printf "\n\n"
if [ -n "$environment" ]; then
  hl_info="$hl_or_dir/$environment - $stage"
else
  hl_info="$hl_or_dir"
fi

echo "You are working on the following environment: $hl_info"
printf "\n\n"

exit 0