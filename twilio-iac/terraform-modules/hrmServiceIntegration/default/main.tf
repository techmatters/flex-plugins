resource "null_resource" "hrm_static_api_key" {
  provisioner "local-exec" {
    working_dir = "${path.module}/../../../../scripts"
    command = "npm run twilioResources -- new-key-with-ssm-secret hrm-static-key ${var.short_environment}_TWILIO_${var.short_helpline}_HRM_STATIC_KEY ${var.helpline} ${var.environment}"
  }
}