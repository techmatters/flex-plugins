variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "environment" {
  description = "Full capitalised environment name, typically 'Production', 'Staging' or 'Development'"
  type        = string
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}