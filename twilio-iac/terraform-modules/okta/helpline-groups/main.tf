/**
 * Helpline-level Okta objects: not tied to an environment, shared by the staging and production apps.
 * Deleting a group removes its members' access to every app, so groups are protected from destroy.
 *
 * Group rules are NOT managed here: Okta only lets Super Admins and Org Admins edit group rules, and
 * the Terraform service app deliberately has neither role. Rules are created by a person; see the
 * okta-org stage output and twilio-iac/docs/okta.md.
 */

resource "okta_group" "helpline" {
  for_each = var.helpline_groups

  name        = each.value.group_name
  description = each.value.group_description

  lifecycle {
    prevent_destroy = true
  }
}
