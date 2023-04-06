ifeq ($(HL),)
$(error No helpline specified. please be sure to set HL=<helpline> before running make)
endif

ifeq ($(HL_ENV),)
$(error No environment specified. please be sure to set HL_ENV=<environment> before running make)
endif

tg_args ?= $(tf_args)     # --terragrunt-log-level debug --terragrunt-debug

TG_ENV = -e TERRAGRUNT_DOWNLOAD=".terragrunt-cache/$(HL)/$(HL_ENV)"

apply-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt apply $(tg_args)

apply-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all apply $(tg_args)

init-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt init $(tg_args)

init-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all init $(tg_args)

plan-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt plan $(tg_args)

plan-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all plan $(tg_args)

destroy-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt destroy $(tg_args)

destroy-all-tg:
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt rum-all destroy $(tg_args)

apply: apply-tg

apply-all: plan-all-tg apply-all-tg

init: init-scripts init-tg

init-all: init-all-tg

plan: plan-tg

plan-all: plan-all-tg

destroy: destroy-tg

destroy-all: destroy-all-tg

hclfmt:
	docker run -it --rm -v $(MY_PWD):$(MOUNT_PATH) -w $(TF_ROOT_PATH) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt hclfmt $(tg_args)
