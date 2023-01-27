// eslint-disable-next-line import/no-extraneous-dependencies
import { Page, Route } from '@playwright/test';
import context from '../global-context';

const DEFAULT_SESSION_RESPONSE = {
  insightsActive: true,
  features: [
    {
      doc_url: 'https://www.twilio.com/docs',
      stage: 'force-disable',
      description: 'This is a test feature.',
      name: 'Test Feature',
      enabled: false,
      id: 'test-feature',
    },
  ],
};

const defaultConfig = (accountSid: string) => ({
  flex_insights_hr: null,
  crm_type: null,
  date_updated: '2023-01-12T16:49:57Z',
  integrations: null,
  markdown: { enabled: true, mode: 'readOnly' },
  debugger_integration: { enabled: true },
  crm_callback_url: null,
  serverless_service_sids: ['ZSxxx'],
  queue_stats_configuration: null,
  plugin_service_enabled: null,
  crm_attributes: null,
  ui_version: '~2.0.0',
  crm_fallback_url: null,
  service_version: null,
  taskrouter_target_workflow_sid: 'WW_task_router',
  messaging_service_instance_sid: null,
  plugin_service_attributes: null,
  call_recording_enabled: true,
  call_recording_webhook_url: null,
  public_attributes: null,
  crm_enabled: null,
  status: 'ok',
  taskrouter_worker_attributes: null,
  chat_service_instance_sid: 'IS_CHAT_SERVICE',
  taskrouter_worker_channels: null,
  ui_dependencies: { react: '17.0.2', 'react-dom': '17.0.2' },
  taskrouter_offline_activity_sid: 'WA_offline',
  notifications: { enabled: true, mode: 'whenNotInFocus' },
  taskrouter_workspace_sid: context.WORKSPACE_SID,
  channel_configs: [
    {
      cbm_attachments: {
        max_file_size: 16777216,
        max_total_file_size: 67108864,
        accepted_extensions: [
          'jpg',
          'jpeg',
          'png',
          'amr',
          'mp3',
          'mp4',
          'pdf',
          'heic',
          'txt',
          'gif',
        ],
        enabled: true,
        number_of_attachments: 1,
      },
      address_type: 'web',
    },
    {
      cbm_attachments: {
        max_file_size: 2097152,
        max_total_file_size: 5242880,
        accepted_extensions: ['jpg', 'jpeg', 'png', 'amr', 'mp3', 'mp4', 'pdf', 'heic'],
        enabled: true,
        number_of_attachments: 1,
      },
      address_type: 'sms',
    },
    {
      cbm_attachments: {
        max_file_size: 16777216,
        max_total_file_size: 67108864,
        accepted_extensions: ['jpg', 'jpeg', 'png', 'amr', 'mp3', 'mp4', 'pdf', 'heic', 'oga'],
        enabled: true,
        number_of_attachments: 1,
      },
      address_type: 'whatsapp',
    },
    {
      cbm_attachments: {
        max_file_size: 157286400,
        max_total_file_size: 157286400,
        accepted_extensions: [
          'jpg',
          'jpeg',
          'png',
          'amr',
          'mp3',
          'mp4',
          'pdf',
          'heic',
          'txt',
          'gif',
        ],
        enabled: true,
        number_of_attachments: 10,
      },
      address_type: 'email',
    },
  ],
  date_created: '2019-12-17T09:58:27Z',
  taskrouter_skills: [
    { minimum: null, multivalue: false, name: 'chat', maximum: null },
    { minimum: null, multivalue: false, name: 'Afrikaans', maximum: null },
    { minimum: null, multivalue: false, name: 'pt-BR', maximum: null },
  ],
  taskrouter_taskqueues: null,
  ui_attributes: {
    version_compatibility: 'yes',
    colorTheme: {
      light: true,
      baseName: 'GreyLight',
      preset: { id: 'mono-light', name: 'Simple Light' },
      overrides: {
        MainHeader: {
          Button: { color: '#000000' },
          Container: { color: '#000000', background: '#FFFFFF' },
          Icon: { color: '#000000' },
        },
        SideNav: {
          Button: { background: '#FFFFFF' },
          Container: { background: '#FFFFFF' },
          Icon: { color: '#000000' },
        },
      },
    },
    showRealtimeQueuesStats: true,
    notifications: { browser: true },
    warmTransfers: { enabled: true },
    version_message: '',
  },
  flex_insights_drilldown: true,
  url: 'https://flex-api.twilio.com/v1/Configuration',
  outbound_call_flows: {
    default: {
      workflow_sid: 'WWxxx',
      enabled: false,
      queue_sid: 'WQ_outbound_calls',
      caller_id: '+12345678',
      location: 'US',
    },
  },
  taskrouter_target_taskqueue_sid: 'WQ_FAKE_QUEUE',
  account_sid: accountSid,
  runtime_domain: 'runtime.flex.domain',
  flex_url: '',
  ui_language: null,
  attributes: {},
  flex_service_instance_sid: 'ISxxx',
  flex_ui_status_report: { enabled: true },
});

const defaultPublicConfig = (accountSid: string) => ({
  meta: {
    page: 0,
    page_size: 50,
    first_page_url: `https://flex-api.twilio.com/v1/Configuration/Public?AccountSid=${accountSid}&PageSize=50&Page=0`,
    previous_page_url: null,
    url: `https://flex-api.twilio.com/v1/Configuration/Public?AccountSid=${accountSid}&PageSize=50&Page=0`,
    next_page_url: null,
    key: 'configurations',
  },
  configurations: [
    {
      url: 'https://flex-api.twilio.com/v1/Configuration/Public',
      runtime_domain: 'runtime.flex.domain',
      public_attributes: null,
      account_sid: accountSid,
    },
  ],
});

export const configurationServices = (page: Page) => {
  async function mockFlexServiceConfigurationPublicEndpoint(
    accountSid: string,
    config: Record<string, any> | undefined = {},
  ): Promise<void> {
    await page.route(
      `https://flex-api.twilio.com/v1/Configuration/Public?AccountSid=${accountSid}`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...defaultPublicConfig(accountSid),
            ...config,
          }),
        });
      },
    );
  }
  async function mockFlexServiceConfigurationEndpoint(
    accountSid: string,
    config: Record<string, any> | undefined = {},
  ): Promise<void> {
    const handler = (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...defaultConfig(accountSid),
          ...config,
        }),
      });
    };
    await page.route(`https://flex-api.twilio.com/v1/Configuration?UiVersion=undefined`, handler);
    await page.route(`https://flex-api.twilio.com/v1/Configuration?UiVersion=2.0.0`, handler);
  }

  async function mockSessionEndpoint(config: Record<string, any> | undefined = {}): Promise<void> {
    await page.route(`https://flex.twilio.com/api/v1/Session`, (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...DEFAULT_SESSION_RESPONSE,
          ...config,
        }),
      });
    });
  }
  return {
    mockFlexServiceConfigurationPublicEndpoint,
    mockFlexServiceConfigurationEndpoint,
    mockSessionEndpoint,
  };
};
