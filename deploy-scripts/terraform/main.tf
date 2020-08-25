/*
* Currently, this Twilio Terraform plugin has support to add subaccounts, Workspaces,
* phone numbers, Workers, TaskQueues, TaskChannels, Workflows, and applications.
* All but the subaccounts, phone numbers, and applications are sub-elements of
* TaskRouter. I (Ariel) am unsure what is meant by "applications".
*
* The plugin also has the downside that some element parameters CANNOT be set via
* Terraform and must be set in the console. This means that the elements must be
* created and destroyed by Terraform, but API calls or human interaction with the
* console is required to configure it. These parameters will be specified below.
*/

// Should be passed in via a tfvars file
variable "account_sid" {}
variable "auth_token" {}
variable "main_phone" {}
variable "design_phone" {}
variable "whatsapp_number" {}
variable "messenger_number" {}

provider "twilio" {
    account_sid = var.account_sid
    auth_token = var.auth_token
}

/* Workspaces
* This plugin DOES NOT allow setting values for Order Priority (FIFO or LIFO).
* It defaults to FIFO. We currently only use this default.
*/
resource "twilio_workspace" "workspace" {
  friendly_name = "Flax Test"
  event_callback_url = null // Optional param
  multi_task_enabled = true // Optional param
}

/* TaskQueues
* This plugin DOES NOT allow setting values for Task Order (LIFO or FIFO) or Queue
* Expression/Target Workers via Terraform. The default task order is FIFO and the
* default target worker expression is none, meaning all workers could get the tasks
* in that queue. To configure a queue which only gives tasks to specific workers,
* extra configuration via the API or console is needed.
*/
resource "twilio_taskQueue" "everyone_queue" {
  friendly_name = "Everyone"
  workspace_sid = twilio_workspace.workspace.id
}

/* Workflows
* This plugin DOES NOT allow setting values for the Task Reservation Timeout or 
* callback urls. The default timeout value is 120. We currently only use the default 
* value and don't use any callback urls.
*/
variable "filter_expression" {
  type = string
  default = <<EOF
"(task.transferTargetType == \"worker\" AND task.targetSid == worker.sid) OR (task.transferTargetType != \"worker\" AND worker.sid != task.ignoreAgent)"
EOF
}

resource "twilio_workflow" "master_workflow" {
  friendly_name = "Master Workflow"
  workspace_sid = twilio_workspace.workspace.id
  configuration = <<EOF
{
  "task_routing": {
    "filters": [
      {
        "filter_friendly_name": "Design",
        "expression": "to==\"${var.design_phone}\" OR twilioNumber==\"${var.design_phone}\"",
        "targets": [
          {
            "queue": "${twilio_taskQueue.everyone_queue.id}",
            "expression": ${var.filter_expression}
          }
        ]
      },
      {
        "filter_friendly_name": "Admin",
        "expression": "to==\"${var.main_phone}\" OR helpline==\"Select helpline\" OR helpline==\"Fake Helpline\" OR helpline==\"DK\" OR twilioNumber CONTAINS \"${var.main_phone}\" OR twilioNumber==\"whatsapp:${var.whatsapp_number}\" OR twilioNumber==\"messenger:${var.messenger_number}\"",
        "targets": [
          {
            "queue": "${twilio_taskQueue.everyone_queue.id}",
            "expression": ${var.filter_expression}
          }
        ]
      }
    ]
  }
}
EOF
}

/* TaskChannels
* Note that a Twilio Workspace makes some default TaskChannels upon creation which
* are NOT under the control of Terraform. These TaskChannels have the friendly
* names Default, Voice, Programmable Chat, SMS, and Video. All but Voice can be
* deleted and remade, and we currently delete and remake the SMS channel to change
* its unique name. Trying to create a channel with the same unique name as an
* existing TaskChannel will result in an error, even if that TaskChannel is not
* controlled by Terraform.
*
* This plugin doesn't allow Channel Optimized Routing to be set, but I (Ariel)
* will admit that I'm not sure what this is or does. It can't be set via the console.
*/
resource "twilio_taskChannel" "whatsapp_channel" {
  friendly_name = "WhatsApp"
  unique_name = "WhatsApp"
  workspace_sid = twilio_workspace.workspace.id
}

resource "twilio_taskChannel" "facebook_channel" {
  friendly_name = "Facebook"
  unique_name = "Facebook"
  workspace_sid = twilio_workspace.workspace.id
}

resource "twilio_taskChannel" "web_channel" {
  friendly_name = "Web"
  unique_name = "Web"
  workspace_sid = twilio_workspace.workspace.id
}

/*
* Activities are the one TaskRouter config sub-element that are missing from the
* plugin. Any custom activities (like our Break activity) must be added via the 
* console or API.
*/

// Workers can be configured with this plugin, but this doesn't seem desirable