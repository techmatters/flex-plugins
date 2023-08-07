/**
 * Common containse the shared locals for all of a helplines environments
 **/

locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  /**
   * This is kindof hacky, but locals that are referenced by other items within the local_config
   * must be defined at the base level becauase a local object cannot reference properties of itself
   **/
  task_language     = ""

  /**
   * The local_config is merged with the defaults_config to create the final common config.
   **/
  local_config = {
    helpline       = ""
    old_dir_prefix = ""

    custom_channels = ["twitter", "instagram"]

    // keys for ustom_channel_attributes  must match the custom_channels list
    custom_channel_attributes = {
      twitter   = templatefile("../../terraform-modules/channels/custom-channel/channel-attributes/twitter-attributes.tftpl", { task_language = local.task_language })
      instagram = templatefile("../../terraform-modules/channels/custom-channel/channel-attributes/instagram-attributes.tftpl", { task_language = local.task_language })
    }
  }
}