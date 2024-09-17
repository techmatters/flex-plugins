terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  additional_events = flatten([
    for subscription,sub_value  in var.subscriptions : [
      for additional_event in sub_value.additional_events : {
        subscription = subscription
        event = additional_event
      }
    ]
  ])
}

resource "twilio_events_sinks_v1" "webhook" {
  description = "${title(var.helpline)} ${title(var.environment)} Webhook Sink"
  sink_configuration = jsonencode({
    destination : var.webhook_url,
    method : "POST",
    batch_events : false
  })
  sink_type = "webhook"
}


resource "twilio_events_subscriptions_v1" "subscription" {
  for_each    = var.subscriptions
  description = "${title(replace(each.key, "_", " "))} Events Subscription"
  sink_sid    = twilio_events_sinks_v1.webhook.sid
  types = [jsonencode({
    type = each.value.event
  })]
}

resource "twilio_events_subscriptions_subscribed_events_v1" "additional_event" {
  for_each    = { for idx, additional_event in local.additional_events :  "${additional_event.subscription}_${additional_event.event}" => additional_event }
  subscription_sid = twilio_events_subscriptions_v1.subscription[each.value.subscription].sid
  type             = each.value.event
}

