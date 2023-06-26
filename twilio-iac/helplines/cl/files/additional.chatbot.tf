locals {
  custom_chatbots = {
    post_survey: {
      sid= module.custom_chatbots.post_survey_bot_es_sid
    }
  }
}

module "custom_chatbots" {
  source         = "../../chatbots/linea-libre-cl"
  serverless_url = local.serverless_url
}
