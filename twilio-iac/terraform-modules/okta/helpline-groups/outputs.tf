output "group_ids" {
  description = "Okta group id per helpline short code."
  value       = { for code, group in okta_group.helpline : code => group.id }
}

output "group_names" {
  value = { for code, group in okta_group.helpline : code => group.name }
}
