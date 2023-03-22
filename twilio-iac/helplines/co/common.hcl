locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  helpline_language = "es-CO"

  local_config = {
    helpline       = "Te Guío"
    old_dir_prefix = "teguio"

    helpline_language  = local.helpline_language
    target_task_name   = "execute_initial_flow"
    task_language      = "es-CO"
    voice_ivr_language = "es-MX"
    operating_info_key = "co"
    definition_version = "co-v1"

    strings = jsondecode(file("../../translations/${local.helpline_language}/strings.json"))

    manage_github_secrets = false
  }
}