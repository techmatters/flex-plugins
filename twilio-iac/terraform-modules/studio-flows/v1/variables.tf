variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "environment" {
  description = "Environment identifier, typically 'production', 'staging' or 'development'"
  type        = string
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "region" {
  description = "AWS region to create the resources"
  type        = string
}

variable "twilio_account_sid" {
  description = "Twilio Account SID (ACxxxx)"
  type        = string
}

variable "studio_flows" {
  type = map(object({
    templatefile = string,
    flow_vars    = map(string)
  }))
  description = "Map of enabled studio flow objects with their variables"
}

variable "workflow_sids" {
  type = map(string)

}

variable "task_channel_sids" {
  type = map(string)
}



