/**
 * okta-app stage (Layer 2): the Okta SAML app that logs a helpline's users into ONE Flex account
 * (helpline + environment). The helpline group itself is helpline-level and lives in the okta-org stage;
 * here it is only looked up by name.
 *
 * Nothing account-specific is committed: the Twilio account SID comes from the existing SSM secrets,
 * the Flex SSO connection id is looked up from Twilio at plan time, and existing apps/groups are
 * found by name.
 */

# Provider versions and backend are generated from stages/okta-backend.tftpl (one required_providers block per root module).

data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}

# Okta API Services app used by Terraform: { "client_id": "...", "private_key_id": "...", "private_key": "<PEM>" }
data "aws_ssm_parameter" "okta_terraform_app" {
  name = "/terraform/okta/terraform_service_app"
}

locals {
  twilio_account_sid = jsondecode(data.aws_ssm_parameter.secrets.value).twilio_account_sid
  okta_credentials   = jsondecode(data.aws_ssm_parameter.okta_terraform_app.value)

  app_name = coalesce(var.okta.app_name, var.helpline)
  code     = upper(var.short_helpline)
  label = coalesce(
    var.okta_app.label,
    var.environment == "production" ? "${local.app_name} (${local.code})" : "STG_${local.app_name} (${local.code})",
  )

  # Standard group assignments (see docs/okta.md):
  #   production: <helpline group> + Tech Matters - Production
  #   staging:    <helpline group> + Tech Matters - Staff + Tech Matters - Test Accounts
  # The helpline group is optional on staging after launch, to keep counsellors out of the wrong environment.
  tech_matters_groups = coalesce(
    var.okta_app.tech_matters_groups,
    var.environment == "production" ? ["Tech Matters - Production"] : ["Tech Matters - Staff", "Tech Matters - Test Accounts"],
  )
  group_names = concat(var.okta_app.include_helpline_group ? [var.okta.group_name] : [], local.tech_matters_groups)

  flex_auth_config    = jsondecode(data.http.flex_auth_config.response_body)
  flex_connection_sid = try(local.flex_auth_config.config_list[0].connection_name, "")
}

provider "okta" {
  org_name       = "techmatters"
  base_url       = "okta.com"
  client_id      = local.okta_credentials.client_id
  private_key    = local.okta_credentials.private_key
  private_key_id = local.okta_credentials.private_key_id
  scopes         = ["okta.apps.read", "okta.apps.manage", "okta.groups.read", "okta.policies.read"]
}

# Public, unauthenticated endpoint used by the Flex login page (and by e2e-tests/okta/ssoLogin.ts).
# Returns the account's Flex SSO connection (JQ...).
data "http" "flex_auth_config" {
  url = "https://services.twilio.com/v1/Flex/Authentication/Config?AccountSid=${local.twilio_account_sid}"

  lifecycle {
    postcondition {
      condition     = self.status_code == 200 && length(try(jsondecode(self.response_body).config_list, [])) > 0
      error_message = "No Flex SSO connection found for this account. Open Twilio Console > Flex > Users and access > Single sign-on (SSO) once, then plan again."
    }
  }
}

data "okta_group" "assigned" {
  for_each = toset(local.group_names)
  name     = each.key
}

# Guard: never create a second app with a label that already exists. Set okta_app.import_existing = true to adopt it.
# (The provider's exact `label` filter returns 400 from Okta, so search by prefix and match exactly here.)
data "okta_apps" "label_search" {
  q = local.label

  lifecycle {
    postcondition {
      condition     = var.okta_app.import_existing || length([for app in self.apps : app.id if app.label == local.label]) == 0
      error_message = "An Okta app labelled '${local.label}' already exists. Set okta_app.import_existing = true to adopt it, or choose another label."
    }
  }
}

# Adopting an existing app (okta_app.import_existing = true). Import blocks are no-ops once the app is in state.
data "okta_app_saml" "existing" {
  for_each    = var.okta_app.import_existing ? toset([local.label]) : toset([])
  label       = each.key
  active_only = true # some helplines have an inactive duplicate with the same label
}

import {
  for_each = data.okta_app_saml.existing
  to       = module.flex_saml_app.okta_app_saml.this
  id       = each.value.id
}

# Only assignments that already exist can be imported; missing ones are created by the plan.
data "okta_app_group_assignments" "existing" {
  for_each = data.okta_app_saml.existing
  id       = each.value.id
}

locals {
  existing_app_id    = try(one(values(data.okta_app_saml.existing)).id, null)
  existing_group_ids = try(one(values(data.okta_app_group_assignments.existing)).groups, [])
}

import {
  for_each = { for name, group in data.okta_group.assigned : name => group.id if contains(local.existing_group_ids, group.id) }
  to       = module.flex_saml_app.okta_app_group_assignment.this[each.key]
  id       = "${local.existing_app_id}/${each.value}"
}

module "flex_saml_app" {
  source = "../../okta/flex-saml-app"

  label                      = local.label
  flex_connection_sid        = local.flex_connection_sid
  groups                     = { for name, group in data.okta_group.assigned : name => group.id }
  attribute_statements_mode  = var.okta_app.attribute_statements_mode
  optional_attribute_sets    = var.okta_app.optional_attribute_sets
  extra_attribute_statements = var.okta_app.extra_attribute_statements

  depends_on = [data.okta_apps.label_search]
}

# Terraform only tracks the groups it assigns. Warn (without blocking) when someone has assigned
# other groups to this app by hand, e.g. Tech Matters - Production on a staging app.
check "no_unexpected_group_assignments" {
  data "okta_app_group_assignments" "current" {
    id = module.flex_saml_app.app_id
  }

  assert {
    condition = length(setsubtract(
      data.okta_app_group_assignments.current.groups,
      [for group in data.okta_group.assigned : group.id],
    )) == 0
    error_message = "The app '${local.label}' has group assignments that are not in the configuration (${join(", ", local.group_names)}). Remove them in Okta or add them to okta_app.tech_matters_groups."
  }
}
