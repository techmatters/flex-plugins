MY_PWD := $(shell git rev-parse --show-toplevel)

ifeq ($(HL_ENV),)
$(error No environment specified. please be sure to set HL_ENV=<environment> before running make. You can also optionally set HL=<helplineShortCode> to specify a specific helpline)
endif

include $(MY_PWD)/twilio-iac/makefiles/*.make
