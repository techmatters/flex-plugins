variable "helpline_okta" {
  description = <<-EOT
    The `okta` block of every helpline's common.hcl that has one, keyed by short code.
      group_name            - the helpline's Okta group (shared by its staging and production apps)
      group_rule_expression - optional group rule that adds users automatically, e.g. user.organization=="SafeSpot"
      group_rule_name       - optional rule name, defaults to group_name
      import_existing       - adopt the group/rule that already exist with these names instead of creating them
  EOT
  type = map(object({
    group_name            = string
    group_rule_expression = optional(string)
    group_rule_name       = optional(string)
    import_existing       = optional(bool, false)
  }))
}
