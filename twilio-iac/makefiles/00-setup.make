DOCKER_IMAGE ?= public.ecr.aws/techmatters/terraform
TF_VER ?= 1.5.3

MY_PWD ?= $(shell git rev-parse --show-toplevel)
MOUNT_PATH = /app
TF_ROOT_PATH = $(MOUNT_PATH)/twilio-iac

ifdef OS
    # We're running Windows, assume powershell
    MY_ENV := $(shell powershell Split-Path -Path (Get-Location) -Leaf)
    MY_RELATIVE_PATH != powershell (Get-Location).Path.Replace(\"\\\", \"/\").Replace(\"$(MY_PWD)\", \"\")
    DIND_ARG = -v "//var/run/docker.sock:/var/run/docker.sock"
else
    # We're NOT running windows, assume bash is available
    MY_ENV := $(shell basename $(CURDIR))
    MY_RELATIVE_PATH := $(shell echo $(CURDIR) | sed -e "s|$(MY_PWD)||")
    DIND_ARG = -v /var/run/docker.sock:/var/run/docker.sock
endif

AWS_DEFAULT_REGION ?= us-east-1 
MY_CONTAINER_PATH = $(MOUNT_PATH)$(MY_RELATIVE_PATH)
PWD_ARG = -v $(MY_PWD):$(MOUNT_PATH) -w $(MY_CONTAINER_PATH)
ENV_ARG = -e MY_ENV=$(MY_ENV) -e HL=$(HL) -e HL_ENV=$(HL_ENV) -e TF_LOG
SECRETS = -e AWS_DEFAULT_REGION -e AWS_REGION -e AWS_SECRET_ACCESS_KEY -e AWS_ACCESS_KEY_ID -e AWS_SESSION_TOKEN -e TWILIO_ACCOUNT_SID -e TWILIO_AUTH_TOKEN -v ~/.aws:/root/.aws -e GITHUB_OWNER -e GITHUB_TOKEN

DEFAULT_ARGS = --init $(SECRETS) $(PWD_ARG) $(ENV_ARG) $(DIND_ARG)
