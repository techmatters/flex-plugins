locals {
  twilio_numbers = ["messenger:111279668497853"]

  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"

  twilio_channels = {
    "webchat" = {"contact_identity" = "", "channel_type" ="web"  },
    "facebook" = {"contact_identity" = "messenger:111279668497853", "channel_type" ="facebook"  }
  }
}