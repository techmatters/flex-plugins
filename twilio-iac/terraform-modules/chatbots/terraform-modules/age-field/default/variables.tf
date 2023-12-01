variable "bot_sid" {
  description = "SID of the Twilio assistant (chatbot) that will use the gender field."
  type        = string
}

variable "unknown_value" {
  description = "The primary value used to denote an 'unknown' age."
  type        = string
  default = "Unknown"
}

variable "unknown_synonyms" {
  description = "Any synonyms value used to denote an 'unknown' age."
  type        = set(string)
  default = ["Prefer not to answer", "X", "prefer not", "prefer not to"]
}