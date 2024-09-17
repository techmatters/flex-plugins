variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "webhook_url" {
  description = "The human readable helpline name."
  type        = string
  default     = "https://hrm-development.tl.techmatters.org/lambda/twilioEventStreams"
}

variable "subscriptions" {
  type = map(object({
    event         = string,
    additional_events     = list(string), 
  }))
  default ={
      default : {
      event  = "com.twilio.studio.flow.execution.started",
        additional_events = ["com.twilio.studio.flow.execution.ended","com.twilio.studio.flow.step.ended"]	
      }
      }
}
