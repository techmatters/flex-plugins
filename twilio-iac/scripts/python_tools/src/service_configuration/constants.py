""" Constants for the service configuration manager """
AWS_ROLE_ARNS: dict[str, str] = {
    'developer': 'arn:aws:iam::712893914485:role/twilio-iac-service-config-developer',
    'manager': 'arn:aws:iam::712893914485:role/twilio-iac-service-config-manager',
}

def get_aws_role_arn(environment: str):
    role_key = "manager" if environment == "production" else "developer"
    aws_role_arn = AWS_ROLE_ARNS.get(role_key)
    return aws_role_arn