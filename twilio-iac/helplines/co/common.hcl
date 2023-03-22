locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  helpline_language = "es-CO"
  task_language     = "es-CO"

  local_config = {
    helpline       = "Te Guío"
    old_dir_prefix = "teguio"

    helpline_language  = local.helpline_language
    target_task_name   = "execute_initial_flow"
    task_language      = local.task_language
    voice_ivr_language = "es-MX"
    operating_info_key = "co"
    definition_version = "co-v1"

    custom_channels = ["twitter", "instagram"]

    custom_channel_attributes = {
      twitter = templatefile("../../terraform-modules/channels/custom-channel/channel-attributes/twitter-attributes.tftpl", { task_language = local.task_language })
      instagram = templatefile("../../terraform-modules/channels/custom-channel/channel-attributes/instagram-attributes.tftpl", { task_language = local.task_language })
    }

    channel_attributes = {
      facebook = templatefile("../../terraform-modules/channels/twilio-channel/channel-attributes/facebook-attributes.tftpl", { task_language = local.task_language })
      webchat = templatefile("../../terraform-modules/channels/twilio-channel/channel-attributes/webchat-attributes.tftpl", { task_language = local.task_language })
      whatsapp = templatefile("../../terraform-modules/channels/twilio-channel/channel-attributes/whatsapp-attributes.tftpl", { task_language = local.task_language })
    }

    strings = jsondecode(file("../../translations/${local.helpline_language}/strings.json"))

    manage_github_secrets = false
  }
}