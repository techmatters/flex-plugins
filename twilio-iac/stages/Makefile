MY_PWD := $(shell git rev-parse --show-toplevel)

include $(MY_PWD)/twilio-iac/makefiles/*.make
include $(MY_PWD)/twilio-iac/makefiles/terragrunt/*.make

init_args := HL=$(HL) HL_ENV=$(HL_ENV)

init-all: init-provision init-chatbot init-configure

init-provision:
	cd $(MY_PWD)/twilio-iac/stages/provision
	make $(init_args) init

init-chatbot:
	cd $(MY_PWD)/twilio-iac/stages/chatbot
	make $(init_args) init

init-configure:
	cd $(MY_PWD)/twilio-iac/stages/configure
	make $(init_args) init
