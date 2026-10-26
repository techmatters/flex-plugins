variable "helpline_groups" {
  description = "One entry per helpline, keyed by short code: the Okta group shared by its staging and production apps."
  type = map(object({
    group_name        = string
    group_description = optional(string, null)
  }))
}
