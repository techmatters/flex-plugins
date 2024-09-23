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
  for_each    = var.subscriptions
  description = "${title(replace(each.key, "_", " "))} ${upper(var.short_helpline)}_${upper(var.short_environment)} Webhook Sink"
  sink_configuration = jsonencode({
    destination = each.value.webhook_url != null ? each.value.webhook_url : var.default_webhook_url
    method : "POST",
    batch_events : false
  })
  sink_type = "webhook"
}

resource "twilio_events_subscriptions_v1" "subscription" {
  for_each    = var.subscriptions
  description = "${title(replace(each.key, "_", " "))} ${upper(var.short_helpline)}_${upper(var.short_environment)} Events Subscription"
  sink_sid    = twilio_events_sinks_v1.webhook_sink[each.key].sid
  types       = [for event in each.value.events : jsonencode({ type = event.type })]
}
/*
I'm leaving this out as this resource doesn't work well.
This is only needed if we would want to add or modify exising events in a subscription wihtout altering the subscription. 
Right now the way to do that is to re-create the subscription.
An apply will show to be successful but some resources will fail the be created.
resource "twilio_events_subscriptions_subscribed_events_v1" "additional_event" {
  #In order to create a resource we need to create a map from the tuple
  for_each    = { for idx, additional_event in local.additional_events :  "${additional_event.subscription}_${additional_event.event}" => additional_event }
  subscription_sid = twilio_events_subscriptions_v1.subscription[each.value.subscription].sid
  type             = each.value.event
}

*/