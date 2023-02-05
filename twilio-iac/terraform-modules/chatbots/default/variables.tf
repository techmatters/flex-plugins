variable "serverless_url" {
  description = "Serverless URL"
  type        = string
}

variable "gender_field_type" {
  description = "Which implementation of the gender field to use, current options: default, safespot"
  type        = string
  default     = "default"
}

variable "unknown_value" {
  description = "The primary value used to denote an 'unknown' age."
  type        = string
  default = "Unknown"
}

variable "unknown_synonyms" {
  description = "Any synonyms value used to denote an 'unknown' age."
  type        = set(string)
  default = ["Prefer not to answer", "X", "prefer not", "prefer not to"]
}