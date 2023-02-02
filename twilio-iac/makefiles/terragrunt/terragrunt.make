ifeq ($(HL),)
$(error No helpline specified. please be sure to set HL=<helpline> before running make)
endif

ifeq ($(HL_ENV),)
$(error No environment specified. please be sure to set HL_ENV=<environment> before running make)
endif

apply-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt apply $(tf_args)

apply-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all apply $(tf_args)

init-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt init $(tf_args)

init-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all init $(tf_args)

plan-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt plan $(tf_args)

plan-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all plan $(tf_args)

destroy-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt destroy $(tf_args)

destroy-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terragrunt rum-all destroy $(tf_args)

apply: apply-tg

apply-all: plan-all-tg apply-all-tg

init: init-tg

init-all: init-all-tg

plan: plan-tg

plan-all: plan-all-tg

destroy: destroy-tg

destroy-all: destroy-all-tg
