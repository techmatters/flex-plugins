/**
 * Copyright (C) 2021-2025 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
/* eslint-disable camelcase */
export type FeatureFlags = {
  // Please keep this in alphabetical order!
  enable_assigned_skill_teams_view_filters: boolean; // Enable the 'Assigned Skill' and 'Unassigned Skill' filters on the teams view
  enable_canned_responses: boolean; // Enables Canned Responses
  enable_conference_status_event_handler: boolean; // Enable conference status event handling. This needs to be set up from flex when accepting a task
  enable_confirm_on_browser_close: boolean; // Enables confirmation dialog on browser close when there are unsaved changes
  enable_csam_clc_report: boolean; // Enables CSAM child Reports
  enable_csam_report: boolean; // Enables CSAM Reports
  enable_dual_write: boolean; // Enables Saving Contacts on External Backends
  enable_emoji_picker: boolean; // Enables Emoji Picker
  enable_external_transcripts: boolean; // Enables Viewing Transcripts Stored Outside of Twilio
  enable_fullstory_monitoring: boolean; // Enables Full Story
  // enable_hang_up_by_hrm_saving - only used in Twilio Lambda
  enable_language_selector: boolean; // Enables the language of the UI to be changed by the user via a dropdown menu
  enable_last_case_status_update_info: boolean; // Enables showing the time, user and changed status of the most recent case status update on the 'Edit Case Summary' page
  // enable_lex_v2 - only used in Twilio Lambda
  enable_llm_summary: boolean; // Enables generation of suggested contact summaries via an LLM
  enable_manual_pulling: boolean; // Enables Adding Another Task
  enable_post_survey: boolean; // Enables Post-Survey
  enable_previous_contacts: boolean; // Enables Previous Contacts Yellow Banner
  enable_region_resource_search: boolean; // Enables specifying a region as well as a province and / or city in Resource Search
  // TODO remove once this changes are enabled
  enable_resouorces_updates: boolean;
  enable_save_insights: boolean; // Enables Saving Aditional Data on Insights
  enable_select_agents_teams_view: boolean; // Enable the checkboxes UI to select counselor(s)
  enable_switchboarding: boolean; // Enables Switchboarding
  enable_switchboarding_move_tasks: boolean; // Enables Switchboarding moving tasks from original queue to switchboard ^ne
  enable_twilio_transcripts: boolean; // Enables Viewing Transcripts Stored at Twilio
  enable_voice_recordings: boolean; // Enables Loading Voice Recordings
  use_prepopulate_mappings: boolean; // Use PrepopulateMappings.json instead of PrepopulateKeys.json
  use_twilio_lambda_for_conference_functions: boolean; // Use the twilio account scoped lambda for conferencing functions
};
