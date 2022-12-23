questions = [
    {
        'tf_var': 'twillio_account_sid',
        'question': 'Twilio Account SID',
        'value': None,
        'regex': r'^AC[a-z0-9]{32}$',
    },
    {
        'tf_var': 'twilio_auth_token',
        'question': 'Twilio Auth Token',
        'value': None,
        'regex': r'^[a-z0-9]{32}$',
    },
    {
        'tf_var': 'datadog_app_id',
        'question': 'Datadog App ID',
        'value': None,
        'regex': r'^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$',
    },
    {
        'tf_var': 'datadog_access_token',
        'question': 'Datadog Access Token',
        'value': None,
        'regex': r'pub[a-z0-9]{32}$',
    },
    {
        'tf_var': 'serverless_url',
        'question': 'Serverless URL',
        'value': None,
        'regex': r'^https:\/\/serverless-[0-9]+-(production|staging)\.twil\.io$',
    },
]
