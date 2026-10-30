# Copyright (C) 2021-2026 Technology Matters
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see https://www.gnu.org/licenses/.

/**
 * Okta for the form builder: one OIDC single-page app and the groups that give access to it.
 *
 *   form-builder-aselo-staff   Aselo staff: every helpline, staff-only settings, Apply
 *   form-builder-<code>        helpline staff: their helpline's drafts, submit for review
 *
 * The browser signs in with authorization code + PKCE (no client secret) against the builder's own
 * authorization server, and sends the access token to the API. API Gateway's JWT authorizer checks
 * it (issuer = that server, audience = api://form-builder). The token's `groups` claim lists only
 * the form-builder-* groups, and the API turns them into a role and helplines. The server only
 * issues tokens to this app, and the org's other authorization servers are not touched.
 * (An app-level groups claim would be simpler, but Okta's provider silently skips it when
 * Terraform signs in with a private key, as ours does.)
 *
 * Group members are added by a person in the Okta console (or by a group rule, which only Super
 * and Org Admins can create). Groups are protected from destroy: deleting one removes access.
 */

# Okta API Services app used by Terraform, shared with twilio-iac/stages/okta-org and okta-app
data "aws_ssm_parameter" "okta_terraform_app" {
  for_each = toset(["client_id", "private_key_id", "private_key"])
  name     = "/terraform/okta/terraform_service_app/${each.key}"
}

provider "okta" {
  org_name       = "techmatters"
  base_url       = "okta.com"
  client_id      = data.aws_ssm_parameter.okta_terraform_app["client_id"].value
  private_key    = data.aws_ssm_parameter.okta_terraform_app["private_key"].value
  private_key_id = data.aws_ssm_parameter.okta_terraform_app["private_key_id"].value
  scopes = [
    "okta.apps.read", "okta.apps.manage", "okta.groups.read", "okta.groups.manage",
    "okta.authorizationServers.read", "okta.authorizationServers.manage",
    # The app gets the org's default sign-in policy, which the provider has to look up
    "okta.policies.read",
  ]
}

locals {
  base_url = "https://${var.domain}"
  audience = "api://form-builder"

  # The local dev server can sign in through the same app, to test the real login
  local_urls = var.allow_local_dev ? ["http://localhost:5180"] : []
}

resource "okta_group" "aselo_staff" {
  name        = "form-builder-aselo-staff"
  description = "Aselo Form Builder: Aselo staff (every helpline, staff-only settings, Apply)"

  lifecycle {
    prevent_destroy = true
  }
}

resource "okta_group" "helpline" {
  for_each = toset(var.helplines)

  name        = "form-builder-${each.key}"
  description = "Aselo Form Builder: ${upper(each.key)} helpline staff (edit drafts, submit for review)"

  lifecycle {
    prevent_destroy = true
  }
}

resource "okta_app_oauth" "form_builder" {
  label = "Aselo Form Builder"
  type  = "browser"

  grant_types                = ["authorization_code"]
  response_types             = ["code"]
  token_endpoint_auth_method = "none"
  pkce_required              = true
  consent_method             = "TRUSTED"

  redirect_uris             = concat(["${local.base_url}/login/callback"], [for url in local.local_urls : "${url}/login/callback"])
  post_logout_redirect_uris = concat(["${local.base_url}/"], [for url in local.local_urls : "${url}/"])

  # Opening the app from the Okta dashboard starts the sign-in on the builder's side
  login_uri    = "${local.base_url}/login"
  login_mode   = "SPEC"
  login_scopes = ["openid", "profile", "email"]

  implicit_assignment = false
  hide_ios            = false
  hide_web            = false
}

resource "okta_auth_server" "form_builder" {
  name        = "Aselo Form Builder"
  description = "Tokens for the Aselo Form Builder API (form-builder.tl.techmatters.org)"
  audiences   = [local.audience]
}

# Only the form-builder-* groups go into the access token
resource "okta_auth_server_claim" "groups" {
  auth_server_id          = okta_auth_server.form_builder.id
  name                    = "groups"
  claim_type              = "RESOURCE"
  value_type              = "GROUPS"
  group_filter_type       = "STARTS_WITH"
  value                   = "form-builder-"
  always_include_in_token = true
  scopes                  = []
}

# Whom the builder signs in for (name, email for "updated by" and notifications)
resource "okta_auth_server_claim" "email" {
  auth_server_id          = okta_auth_server.form_builder.id
  name                    = "email"
  claim_type              = "RESOURCE"
  value_type              = "EXPRESSION"
  value                   = "user.email"
  always_include_in_token = true
}

resource "okta_auth_server_claim" "name" {
  auth_server_id          = okta_auth_server.form_builder.id
  name                    = "name"
  claim_type              = "RESOURCE"
  value_type              = "EXPRESSION"
  value                   = "user.firstName + \" \" + user.lastName"
  always_include_in_token = true
}

resource "okta_auth_server_policy" "form_builder" {
  auth_server_id   = okta_auth_server.form_builder.id
  name             = "Aselo Form Builder"
  description      = "Only the form builder app gets tokens"
  priority         = 1
  client_whitelist = [okta_app_oauth.form_builder.client_id]
}

resource "okta_auth_server_policy_rule" "form_builder" {
  auth_server_id       = okta_auth_server.form_builder.id
  policy_id            = okta_auth_server_policy.form_builder.id
  name                 = "Signed-in users"
  priority             = 1
  grant_type_whitelist = ["authorization_code"]
  scope_whitelist      = ["openid", "profile", "email"]
  group_whitelist      = ["EVERYONE"]

  # A working session's worth; the app signs in again when it expires
  access_token_lifetime_minutes = 480
}

resource "okta_app_group_assignment" "this" {
  for_each = merge(
    { "aselo-staff" = okta_group.aselo_staff.id },
    { for code, group in okta_group.helpline : code => group.id },
  )

  app_id   = okta_app_oauth.form_builder.id
  group_id = each.value
}
