terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {}

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
  for_each = {
  for sub_name, sub in var.subscriptions : sub_name => {
    for event in sub.additional_events : "${sub_name}_${event}" => {
        subscription_sid = twilio_events_subscriptions_v1.subscription[sub_name].sid
        event            = event
      }
    }
  }
  subscription_sid = each.value.subscription_sid
  type             = each.value.event
}

