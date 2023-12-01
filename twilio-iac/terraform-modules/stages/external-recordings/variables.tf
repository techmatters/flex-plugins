variable "environment" {
  description = "The environment for the helpline."
  type        = string
}

variable "short_environment" {
  description = "The short code for the environment."
  type        = string
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type        = string
}

variable "enable_external_recordings" {
  description = "Enable external recordings for the helpline."
  type        = bool
}
