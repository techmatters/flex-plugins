locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline       = "Telefon Zaufania"
    old_dir_prefix = "telefonzaufania-pl"

    default_autopilot_chatbot_enabled = true

    twilio_channels = {
      "webchat" = { "contact_identity" = "", "channel_type" = "web" }
    }
  }
}