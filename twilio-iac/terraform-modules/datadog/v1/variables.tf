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
    type = map(object({
    flow_sid         = string,
    enable_datadog_monitor = optional(bool, false)
    custom_monitor = optional(object({
      query = optional(string,null)
      custom_schedule = optional(object({
        rrule = optional(string)
        timezone = optional(string)
      }),null)
    }), {
      query = null
      custom_schedule = null
    })
    
  }))
}

variable "enable_datadog_monitoring" {
  type    = bool
  default = false
}

variable "datadog_tags_bucket" {
  description = "S3 bucket (us-east-1) holding the Datadog Reference Table files (aselo_twilio_accounts.csv, aselo_twilio_flows.csv) and the per-helpline files"
  type        = string
  default     = ""
}

variable "twilio_account_sid" {
  description = "Twilio account SID of this helpline/environment, used to match its logs in Datadog"
  type        = string
  default     = ""
}

variable "studio_flow_sids" {
  description = "Non-channel Studio flow SIDs (e.g. post surveys) by flow name, output of the studio-flows module"
  type        = map(string)
  default     = {}
}