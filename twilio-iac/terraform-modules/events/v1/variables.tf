variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "environment" {
  description = "Environment identifier, typically 'production', 'staging' or 'development'"
  type        = string
}

variable "webhook_url" {
  description = "The human readable helpline name."
  type        = string
  default     = "https://hrm-development.tl.techmatters.org/lambda/twilioEventStreams"
}

variable "subscription" {
  type = map(object({
    event         = string
  }))
}

variable "additional_events" {
  type = list(string)
}
