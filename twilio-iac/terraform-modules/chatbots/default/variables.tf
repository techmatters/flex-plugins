variable "serverless_url" {
  description = "Serverless URL"
  type        = string
}

variable "gender_field_type" {
  description = "Which implementation of the gender field to use, current options: default, safespot"
  type        = string
  default     = "default"
}