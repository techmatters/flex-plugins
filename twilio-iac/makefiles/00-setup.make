.PHONY: get init plan apply destroy
.DEFAULT_GOAL := help

DOCKER_IMAGE := public.ecr.aws/techmatters/terraform

ifdef OS
    # We're running Windows, assume powershell
    #TODO: Test this on a windows system where docker actually works
    SECRETS = -e AWS_DEFAULT_REGION -e AWS_SECRET_ACCESS_KEY -e AWS_ACCESS_KEY_ID -e TWILIO_ACCOUNT_SID -e TWILIO_AUTH_TOKEN -v ~/.aws:/root/.aws -e GITHUB_OWNER -e GITHUB_TOKEN
    #TODO: fix this to navigate up two dirs instead of one
    MY_PWD := $(shell powershell Split-Path -Path (Get-Location) -Parent)
    MY_ENV := $(shell powershell Split-Path -Path (Get-Location) -Leaf)
    DIND_ARG = -v "//var/run/docker.sock:/var/run/docker.sock"
else
    # We're NOT running windows, assume bash is available
    SECRETS = -e AWS_DEFAULT_REGION -e AWS_SECRET_ACCESS_KEY -e AWS_ACCESS_KEY_ID -e TWILIO_ACCOUNT_SID -e TWILIO_AUTH_TOKEN -v ~/.aws:/root/.aws -e GITHUB_OWNER -e GITHUB_TOKEN
    MY_PWD := $(shell cd ../../; pwd)
    MY_ENV := $(shell basename $(CURDIR))
    DIND_ARG = -v /var/run/docker.sock:/var/run/docker.sock
endif

PWD_ARG = -v $(MY_PWD):/app -w /app/twilio-iac/$(MY_ENV)
ENV_ARG = -e MY_ENV=$(MY_ENV) -e SSM_DB_SECRET_NAME=$(SSM_DB_SECRET_NAME)

DEFAULT_ARGS = $(SECRETS) $(PWD_ARG) $(ENV_ARG) $(DIND_ARG)
