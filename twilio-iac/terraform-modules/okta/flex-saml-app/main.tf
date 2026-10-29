/**
 * One Okta SAML app that logs users into one Twilio Flex account (one helpline + environment).
 * The SAML settings below are the Aselo standard; the attributes come from attribute-statements.json,
 * which twilio-iac/scripts/okta also reads, so code and checks never drift apart.
 */

locals {
  standard_attributes = jsondecode(file("${path.module}/attribute-statements.json")).attributes

  attributes = concat(
    [
      for attr in local.standard_attributes : {
        name      = attr.name
        namespace = attr.namespace
        legacy    = attr.legacy
        federated = attr.federated
      }
      if lookup(attr, "optional_set", null) == null || contains(var.optional_attribute_sets, lookup(attr, "optional_set", ""))
    ],
    var.extra_attribute_statements,
  )

  namespace_urns = {
    basic       = "urn:oasis:names:tc:SAML:2.0:attrname-format:basic"
    uri         = "urn:oasis:names:tc:SAML:2.0:attrname-format:uri"
    unspecified = "urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified"
  }

  flex_callback_url = "${var.flex_login_base_url}/login/callback?connection=${var.flex_connection_sid}"
}

resource "okta_app_saml" "this" {
  label  = var.label
  status = var.status

  # Flex (service provider) endpoints
  sso_url     = local.flex_callback_url
  recipient   = local.flex_callback_url
  destination = local.flex_callback_url
  audience    = "urn:flex:${var.flex_connection_sid}"

  # Signing: SHA-256 only, response and assertion signed, no encryption (Flex does not support it)
  signature_algorithm = "RSA_SHA256"
  digest_algorithm    = "SHA256"
  response_signed     = true
  assertion_signed    = true

  subject_name_id_format   = "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
  subject_name_id_template = "$${user.userName}"
  idp_issuer               = "http://www.okta.com/$${org.externalKey}"
  authn_context_class_ref  = "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport"
  honor_force_authn        = true

  user_name_template      = "$${source.login}"
  user_name_template_type = "BUILT_IN"

  accessibility_self_service = false
  implicit_assignment        = false
  hide_ios                   = false
  hide_web                   = false
  auto_submit_toolbar        = false

  authentication_policy = var.authentication_policy_id

  dynamic "attribute_statements" {
    for_each = var.attribute_statements_mode == "legacy" ? local.attributes : []
    content {
      type      = "EXPRESSION"
      name      = attribute_statements.value.name
      namespace = local.namespace_urns[attribute_statements.value.namespace]
      values    = [attribute_statements.value.legacy]
    }
  }

  lifecycle {
    # A Flex app must point at a real Flex connection, and names must not carry stray whitespace
    # (a trailing space silently creates a differently named Flex worker attribute).
    precondition {
      condition     = alltrue([for attr in local.attributes : attr.name == trimspace(attr.name)])
      error_message = "An attribute statement name has leading or trailing whitespace."
    }
  }
}

# New attribute statements (federated claims). Only used when attribute_statements_mode = "federated".
resource "okta_app_federated_claim" "this" {
  for_each = var.attribute_statements_mode == "federated" ? { for attr in local.attributes : attr.name => attr } : {}

  app_id     = okta_app_saml.this.id
  name       = each.key
  expression = each.value.federated
}

# One resource per group (not okta_app_group_assignments): adding or removing a single group,
# e.g. the optional helpline group on a staging app, is then an isolated change with no reordering.
# Import id: "<app id>/<group id>".
resource "okta_app_group_assignment" "this" {
  for_each = var.groups

  app_id   = okta_app_saml.this.id
  group_id = each.value
}
