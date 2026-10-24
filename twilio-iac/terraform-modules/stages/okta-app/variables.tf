variable "helpline" {
  description = "Helpline display name from common.hcl (default for okta.app_name)."
  type        = string
}

variable "short_helpline" {
  type = string
}

variable "environment" {
  type = string
}

variable "okta" {
  description = <<-EOT
    Helpline-level Okta settings (common.hcl). Shared by both environments.
      group_name            - the helpline's Okta group, created by the okta-org stage
      app_name              - name used in app labels, defaults to var.helpline
      group_rule_expression, group_rule_name, import_existing - used by the okta-org stage only
  EOT
  type = object({
    group_name            = string
    app_name              = optional(string)
    group_rule_expression = optional(string)
    group_rule_name       = optional(string)
    import_existing       = optional(bool)
  })
  default = null

  validation {
    condition     = var.okta != null
    error_message = "This helpline has no 'okta' block in common.hcl."
  }
}

variable "okta_app" {
  description = <<-EOT
    Environment-level Okta app settings (staging.hcl / production.hcl).
      import_existing            - adopt the app that already exists with this label instead of creating one
      label                      - override the default label ("STG_<app_name> (<CODE>)" / "<app_name> (<CODE>)")
      include_helpline_group     - assign the helpline group (set false to keep counsellors out of staging after launch)
      tech_matters_groups        - override the Tech Matters groups for this environment
      attribute_statements_mode  - "legacy" or "federated" (new attribute statements)
      optional_attribute_sets    - optional standard attributes: "labels" (labels.stringarray), "team" (team)
      extra_attribute_statements - helpline-specific attributes
  EOT
  type = object({
    import_existing           = optional(bool, false)
    label                     = optional(string)
    include_helpline_group    = optional(bool, true)
    tech_matters_groups       = optional(list(string))
    attribute_statements_mode = optional(string, "legacy")
    optional_attribute_sets   = optional(list(string), [])
    extra_attribute_statements = optional(list(object({
      name      = string
      namespace = optional(string, "basic")
      legacy    = string
      federated = string
    })), [])
  })
  default = null

  validation {
    condition     = var.okta_app != null
    error_message = "This helpline/environment has no 'okta_app' block in its environment file."
  }
}
