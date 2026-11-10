variable "label" {
  description = "Okta app label, e.g. 'STG_SafeSpot (JM)' or 'SafeSpot (JM)'."
  type        = string
}

variable "flex_connection_sid" {
  description = "Flex SSO connection id (JQ...) of the Twilio account this app logs into."
  type        = string

  validation {
    condition     = can(regex("^JQ[0-9a-f]{32}$", var.flex_connection_sid))
    error_message = "flex_connection_sid must look like JQ followed by 32 hex characters."
  }
}

variable "flex_login_base_url" {
  description = "Flex login host. All current helplines use us1."
  type        = string
  default     = "https://login.flex.us1.twilio.com"
}

variable "groups" {
  description = "Okta groups assigned to the app: map of group name => group id."
  type        = map(string)
}

variable "attribute_statements_mode" {
  description = "'legacy' = legacy profile attribute statements on the app. 'federated' = new attribute statements (federated claims)."
  type        = string
  default     = "legacy"

  validation {
    condition     = contains(["legacy", "federated"], var.attribute_statements_mode)
    error_message = "attribute_statements_mode must be 'legacy' or 'federated'."
  }
}

variable "optional_attribute_sets" {
  description = "Optional standard attributes to include, by optional_set in attribute-statements.json: \"labels\" (labels.stringarray), \"team\" (team)."
  type        = list(string)
  default     = []
}

variable "extra_attribute_statements" {
  description = "Helpline-specific attributes appended after the standard ones (e.g. location, counselorLanguage)."
  type = list(object({
    name      = string
    namespace = optional(string, "basic")
    legacy    = string
    federated = string
  }))
  default = []
}

variable "authentication_policy_id" {
  description = "Okta app sign-in (authentication) policy id. Null leaves the policy unmanaged."
  type        = string
  default     = null
}

variable "status" {
  description = "ACTIVE or INACTIVE."
  type        = string
  default     = "ACTIVE"
}
