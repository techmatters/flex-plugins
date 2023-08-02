locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline       = "Kellimni"
    old_dir_prefix = "mt-kellimni"

    helpline_region = "eu-west-1"

    strings_en  = jsondecode(file("../../translations/en-MT/strings.json"))
    strings_mt  = jsondecode(file("../../translations/mt-MT/strings.json"))
    strings_ukr = jsondecode(file("../../translations/ukr-MT/strings.json"))
  }
}