#!/usr/bin/env bash

# export LOG_LEVEL=DEBUG

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
. ${script_dir}/../setup.sh

npm run twilioResources -- import-account-defaults --helplineShortCode="${HL}" --helplineEnvironment="${HL_ENV}" --stage="${MY_ENV}"
