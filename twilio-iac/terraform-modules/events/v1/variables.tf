variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "default_webhook_url" {
  description = "The human readable helpline name."
  type        = string
}

variable "subscriptions" {
  type = map(object({
    webhook_url         = optional(string),
    events               = list(object({
      type = string,
      schema_version = optional(string)
    }))
  }))
}
