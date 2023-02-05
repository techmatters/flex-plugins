variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
  default = null
}

variable "helplines" {
  description = "List of helplines to route via helpline queue"
  type        = list(string)
  default = null
}

variable "serverless_url" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "custom_target_workers" {
  description = "Setting this will override the default task queue expression for target, which is locals.helplines_filter"
  type = string
  default = ""
}

variable "ecpat_messenger_number" {
  description = "Messanger number (FB page id) for ECPAT queue"
  type = string
}

variable "eyca_messenger_number" {
  description = "Messanger number (FB page id) for EYCA queue"
  type = string
}

