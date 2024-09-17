terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {

}

resource "twilio_events_sinks_v1" "webhook_sink" {
  description = "${title(var.helpline)} ${title(var.environment)} Webhook Sink"
  sink_configuration = jsonencode({
    destination : var.webhook_url,
    method : "POST",
    batch_events : false
  })
  sink_type = "webhook"
}


resource "twilio_events_subscriptions_v1" "subscription" {
  description = "${title(var.helpline)} ${title(var.environment)} Events Subscription"
  sink_sid    = twilio_events_sinks_v1.webhook.sid
  types = [jsonencode({
    type = var.subscription.event
  })]
}

resource "twilio_events_subscriptions_subscribed_events_v1" "additional_event" {
  #In order to create a resource we need to create a map from the tuple
  for_each    = { for idx, additional_event in var.additional_events :  "${additional_event}" => additional_event }
  subscription_sid = twilio_events_subscriptions_v1.subscription.sid
  type             = each.value
}

