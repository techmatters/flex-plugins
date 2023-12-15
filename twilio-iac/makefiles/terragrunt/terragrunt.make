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

apply: verify-pre-work apply-tg

apply-all: verify-pre-work plan-all-tg apply-all-tg

init: verify-pre-work init-scripts init-tg

init-all: verify-pre-work init-all-tg

plan: verify-pre-work plan-tg

plan-all: verify-pre-work plan-all-tg

destroy: destroy-tg

clean:
	find . -type d -name ".terragrunt-cache" -exec rm -rf {} +

destroy-all: destroy-all-tg

hclfmt:
	docker run -it --rm -v $(MY_PWD):$(MOUNT_PATH) -w $(TF_ROOT_PATH) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt hclfmt $(tg_args)
