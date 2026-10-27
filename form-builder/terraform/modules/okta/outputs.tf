# What the app and the API Gateway JWT authorizer need. None of these are secrets.
output "issuer" {
  value = okta_auth_server.form_builder.issuer
}

output "audience" {
  value = local.audience
}

output "client_id" {
  value = okta_app_oauth.form_builder.client_id
}

output "group_names" {
  value = concat([okta_group.aselo_staff.name], [for group in okta_group.helpline : group.name])
}
