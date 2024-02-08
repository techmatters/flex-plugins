GIT_ROOT := $(shell git rev-parse --show-toplevel)

include $(GIT_ROOT)/twilio-iac/makefiles/*.make
include $(GIT_ROOT)/twilio-iac/makefiles/terragrunt/*.make
include $(GIT_ROOT)/twilio-iac/makefiles/utils/*.make

init_args := HL=$(HL) HL_ENV=$(HL_ENV)

##@ Root stages - Usage: make [target] HL=[hl short code] HL_ENV=[hl environment]

init-all: init-provision init-chatbot init-configure ## Initialize all stages

init-provision: ## Initialize the provision stage
	cd $(GIT_ROOT)/twilio-iac/stages/provision
	make $(init_args) init

init-chatbot: ## Initialize the chatbot stage
	cd $(GIT_ROOT)/twilio-iac/stages/chatbot
	make $(init_args) init

init-configure: ## Initialize the configure stage
	cd $(GIT_ROOT)/twilio-iac/stages/configure
	make $(init_args) init
