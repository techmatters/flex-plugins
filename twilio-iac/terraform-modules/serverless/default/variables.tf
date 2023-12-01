variable "twilio_account_sid" {
  type = string
}

variable "twilio_auth_token" {
  type = string
}

variable "ui_editable" {
  description = " Whether or not the service is editable in the console"
  type        = bool
  default = false
}
