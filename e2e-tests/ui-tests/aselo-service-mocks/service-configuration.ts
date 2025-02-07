/**
 * Copyright (C) 2021-2023 Technology Matters
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

import context from './global-context';

/**
 * Faked out service configiutration response
 */
export const serviceConfigurationAttributes = () => ({
  feature_flags: {
    enable_fullstory_monitoring: true,
    enable_external_transcripts: true,
    enable_upload_documents: true,
    enable_previous_contacts: true,
    enable_contact_editing: true,
    enable_case_management: true,
    enable_twilio_transcripts: true,
    enable_offline_contact: true,
    enable_filter_cases: true,
    enable_sort_cases: true,
    enable_transfers: true,
    enable_manual_pulling: true,
    enable_transcripts: true,
    enable_csam_clc_report: true,
    enable_canned_responses: true,
    enable_save_insights: true,
    enable_dual_write: false,
    enable_csam_report: true,
    post_survey_serverless_handled: true,
    enable_voice_recordings: true,
    enable_post_survey: true,
    enable_permissions_from_backend: true,
  },
  seenOnboarding: true,
  permissionConfig: 'e2e',
  definitionVersion: 'demo-v1',
  hrm_api_version: 'v0',
  monitoringEnv: 'production',
  hrm_base_url: context.HRM_BASE_URL,
  pdfImagesSource: 'https://tl-public-chat.s3.amazonaws.com',
  logo_url: 'https://aselo-logo.s3.amazonaws.com/145+transparent+background+no+TM.png',
  multipleOfficeSupport: true,
  // clip trailing slash until it's fixed in plugin
  serverless_base_url: context.SERVERLESS_BASE_URL.toString().substring(
    0,
    context.SERVERLESS_BASE_URL.toString().length - 1,
  ),
  form_definitions_base_url: context.FORM_DEFINITIONS_BASE_URL.toString().substring(
    0,
    context.FORM_DEFINITIONS_BASE_URL.toString().length - 1,
  ),
});
