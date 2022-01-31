terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.11.1"
    }
  }
}

resource "twilio_chat_services_v2" "flex_chat_service" {
  friendly_name = "Flex Chat Service"
}

resource "twilio_proxy_services_v1" "flex_proxy_service" {
  unique_name = "Flex Proxy Service"
}

resource "twilio_sync_services_v1" "shared_state_service" {
  friendly_name                   = "Shared State Service"
}
