
output "chatbot_sids" {
  value = merge(local.chatbot_sids, local.custom_chatbot_sids)
}
