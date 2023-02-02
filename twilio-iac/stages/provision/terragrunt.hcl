locals {
  config = jsondecode(run_cmd("node", "../../scripts/getConfig/provision.js", get_env("HL"), get_env("HL_ENV")))
}

