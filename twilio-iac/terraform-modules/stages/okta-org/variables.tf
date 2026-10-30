variable "helpline_okta" {
  description = <<-EOT
    The `okta` block of every helpline's common.hcl that has one, keyed by short code.
      group_name      - the helpline's Okta group (shared by its staging and production apps)
      group_rule      - optional rule that adds users to the group automatically. Set exactly ONE of:
                          email_domains = ["@example.org"]  -> String.stringContains(user.email,"@example.org")
                          organizations = ["Kellimni"]      -> user.organization=="Kellimni"
                          expression    = "<Okta Expression Language>"  for anything else
                        Several values are joined with OR. Optional `name` (defaults to group_name).
      import_existing - adopt the group/rule that already exist with these names instead of creating them
  EOT
  type = map(object({
    group_name = string
    group_rule = optional(object({
      email_domains = optional(list(string))
      organizations = optional(list(string))
      expression    = optional(string)
      name          = optional(string)
    }))
    import_existing = optional(bool, false)
  }))

  validation {
    condition = alltrue([
      for okta in var.helpline_okta : okta.group_rule == null || length([
        for value in [okta.group_rule.email_domains, okta.group_rule.organizations, okta.group_rule.expression] : value if value != null
      ]) == 1
    ])
    error_message = "Each okta.group_rule must set exactly one of email_domains, organizations or expression."
  }
}
