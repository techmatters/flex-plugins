output "app_id" {
  value = module.flex_saml_app.app_id
}

output "label" {
  value = module.flex_saml_app.label
}

output "flex_connection_sid" {
  value = local.flex_connection_sid
}

output "assigned_groups" {
  value = local.group_names
}

output "attribute_names" {
  value = module.flex_saml_app.attribute_names
}

# Paste these into Twilio Console > Flex > Users and access > Single sign-on (SSO).
# Also printed by twilio-iac/scripts/okta/flexSsoHandoff.mjs.
output "flex_sso_settings" {
  value = module.flex_saml_app.flex_sso_settings
}
