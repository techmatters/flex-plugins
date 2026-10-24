variable "helpline_groups" {
  description = <<-EOT
    One entry per helpline, keyed by short code. Each helpline gets one Okta group shared by its
    staging and production apps, plus an optional group rule that adds users automatically.
  EOT
  type = map(object({
    group_name        = string
    group_description = optional(string, null)
    group_rule = optional(object({
      name       = optional(string, null) # defaults to the group name (max 50 characters)
      expression = string                 # Okta Expression Language, e.g. user.organization=="SafeSpot"
      status     = optional(string, "ACTIVE")
    }), null)
  }))
}
