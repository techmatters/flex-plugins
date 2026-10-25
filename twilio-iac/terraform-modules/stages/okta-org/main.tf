/**
 * okta-org stage (Layer 1): Okta objects that belong to a helpline but not to an environment.
 * One run covers every helpline that has an `okta` block in its common.hcl.
 * Provider versions and backend are generated from stages/okta-backend.tftpl.
 */

# Okta API Services app used by Terraform, one SSM parameter per value (easy to enter in the AWS console):
#   /terraform/okta/terraform_service_app/client_id       (String)
#   /terraform/okta/terraform_service_app/private_key_id  (String, the key's KID in Okta)
#   /terraform/okta/terraform_service_app/private_key     (SecureString, PEM exactly as Okta shows it)
data "aws_ssm_parameter" "okta_terraform_app" {
  for_each = toset(["client_id", "private_key_id", "private_key"])
  name     = "/terraform/okta/terraform_service_app/${each.key}"
}

locals {
  helpline_groups = {
    for code, okta in var.helpline_okta : code => {
      group_name = okta.group_name
      group_rule = okta.group_rule_expression == null ? null : {
        name       = coalesce(okta.group_rule_name, okta.group_name)
        expression = okta.group_rule_expression
      }
    }
  }

  importing = { for code, okta in var.helpline_okta : code => okta if okta.import_existing }
}

provider "okta" {
  org_name       = "techmatters"
  base_url       = "okta.com"
  client_id      = data.aws_ssm_parameter.okta_terraform_app["client_id"].value
  private_key    = data.aws_ssm_parameter.okta_terraform_app["private_key"].value
  private_key_id = data.aws_ssm_parameter.okta_terraform_app["private_key_id"].value
  scopes         = ["okta.groups.read", "okta.groups.manage"]
}

# Adopting existing groups/rules (import_existing = true). Import blocks are no-ops once in state.
data "okta_group" "existing" {
  for_each = local.importing
  name     = each.value.group_name
}

data "okta_group_rule" "existing" {
  for_each = { for code, okta in local.importing : code => okta if okta.group_rule_expression != null }
  name     = coalesce(each.value.group_rule_name, each.value.group_name)
}

import {
  for_each = data.okta_group.existing
  to       = module.helpline_groups.okta_group.helpline[each.key]
  id       = each.value.id
}

import {
  for_each = data.okta_group_rule.existing
  to       = module.helpline_groups.okta_group_rule.helpline[each.key]
  id       = each.value.id
}

module "helpline_groups" {
  source = "../../okta/helpline-groups"

  helpline_groups = local.helpline_groups
}
