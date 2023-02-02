
variable "custom_flow_definition" {
  type = string
  default = ""
  description = "Override the default flow by setting this"
}

variable "master_workflow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "voice_task_channel_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "voice_ivr_language" {
  description = "Language for the IVR voice"
  type        = string
}

variable "voice_ivr_greeting_message" {
  type = string
  default = ""
  description = "IVR greeting message"
}

variable "custom_channel_attributes" {
  type = string
  default = ""
  description = "Override the default flow by setting this"
}
