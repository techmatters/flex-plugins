variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable channel_studio_flow_sids {
    description = "Channel studio flow sids"
    type = map(string)
}

variable "enable_datadog_monitoring" {
  type    = bool
  default = false
}