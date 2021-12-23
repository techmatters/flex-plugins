resource "twilio_chat_services_v2" "flex_chat_service" {
  friendly_name = "Flex Chat Service"
}

resource "twilio_proxy_services_v1" "flex_proxy_service" {
  unique_name = "Flex Proxy Service"
}