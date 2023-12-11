AWS_CRED_ENV = AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY) AWS_SESSION_TOKEN=$(AWS_SESSION_TOKEN)

check-jq:
	@which jq > /dev/null || (echo "jq is not installed, please install jq" && exit 1)

check-role:
	@test -n "$(ROLE)" || (echo "You must provide a ROLE option for this command" && exit 1)

extract-aws-account-id: check-role
	$(eval AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query "Account" --output text))
	$(eval export ASSUME_ROLE_ARN := arn:aws:iam::$(AWS_ACCOUNT_ID):role/$(ROLE))
	@echo "Generated and exported Assume Role ARN: $(ASSUME_ROLE_ARN)"

export-aws-credentials: check-jq extract-aws-account-id
	$(eval AWS_CREDENTIALS := $(shell aws sts assume-role --role-arn $(ASSUME_ROLE_ARN) --role-session-name shell-session))
	$(if $(AWS_CREDENTIALS),,$(error Failed to assume AWS role))
	$(eval export AWS_ACCESS_KEY_ID := $(shell echo '$(AWS_CREDENTIALS)' | jq -r '.Credentials.AccessKeyId'))
	$(eval export AWS_SECRET_ACCESS_KEY := $(shell echo '$(AWS_CREDENTIALS)' | jq -r '.Credentials.SecretAccessKey'))
	$(eval export AWS_SESSION_TOKEN := $(shell echo '$(AWS_CREDENTIALS)' | jq -r '.Credentials.SessionToken'))
