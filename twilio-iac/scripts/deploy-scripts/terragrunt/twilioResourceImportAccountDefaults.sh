#!/usr/bin/env bash

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
. ${script_dir}/../setup.sh

npm run twilioResources -- import-account-defaults -hl=${HL} -hl_env=${HL_ENV} -st=$(MY_ENV) -d
