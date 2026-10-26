/**
 * okta-org stage (Layer 1): Okta objects that belong to a helpline but not to an environment.
 * One run covers every helpline that has an `okta` block in its common.hcl.
 * Provider versions and backend are generated from stages/okta-backend.tftpl.
 *
 * Manages the helpline groups. Group rules are only DESCRIBED here (output `group_rules`): Okta lets
 * only Super Admins and Org Admins edit rules, so a person creates them in the Okta console.
 * twilio-iac/scripts/okta/verifySso.mjs and auditGroupRules.mjs check they exist and match.
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
  # Each rule's Okta expression, built from its structured form. Keep in sync with
  # twilio-iac/scripts/okta/lib/groupRules.mjs, which the checks use.
  group_rule_expressions = {
    for code, okta in var.helpline_okta : code => (
      okta.group_rule.expression != null ? okta.group_rule.expression :
      okta.group_rule.organizations != null ? join(" OR ", [for org in okta.group_rule.organizations : "user.organization==\"${org}\""]) :
      join(" OR ", [for domain in okta.group_rule.email_domains : "String.stringContains(user.email,\"${domain}\")"])
    )
    if okta.group_rule != null
  }

  helpline_groups = {
    for code, okta in var.helpline_okta : code => { group_name = okta.group_name }
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

# Adopting existing groups (import_existing = true). Import blocks are no-ops once in state.
data "okta_group" "existing" {
  for_each = local.importing
  name     = each.value.group_name
}

import {
  for_each = data.okta_group.existing
  to       = module.helpline_groups.okta_group.helpline[each.key]
  id       = each.value.id
}

# Group rules used to be managed here (JM and MT were imported). Drop them from state WITHOUT
# deleting them in Okta. Can be deleted once every environment's state no longer has them.
removed {
  from = module.helpline_groups.okta_group_rule.helpline

  lifecycle {
    destroy = false
  }
}

module "helpline_groups" {
  source = "../../okta/helpline-groups"

  helpline_groups = local.helpline_groups
}
