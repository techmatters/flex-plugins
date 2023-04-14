locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline       = "Kids Help Phone"
    old_dir_prefix = "kidshelpphone"

    definition_version = "ca-v1"

    default_autopilot_chatbot_enabled = false

    twilio_channels = {
      "webchat" = { "contact_identity" = "", "channel_type" = "web" }
    }
    task_queues = [
      { 
        "friendly_name" = "KHP English",
        "target_workers" = "routing.skills HAS 'KHP English'"
      }
     ]

   





  }
}
