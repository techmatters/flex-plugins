tg_args ?= $(tf_args)     # --terragrunt-log-level debug --terragrunt-debug

TG_ENV = -e TERRAGRUNT_DOWNLOAD=".terragrunt-cache/$(HL)/$(HL_ENV)"

verify-env:
	ifeq ($(HL),)
	$(error No helpline specified. please be sure to set HL=<helpline> before running make)
	endif

	ifeq ($(HL_ENV),)
	$(error No environment specified. please be sure to set HL_ENV=<environment> before running make)
	endif

apply-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt apply $(tg_args)

apply-all-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all apply $(tg_args)

init-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt init $(tg_args)

init-all-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all init $(tg_args)

plan-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt plan $(tg_args)

plan-all-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt run-all plan $(tg_args)

destroy-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt destroy $(tg_args)

destroy-all-tg: verify-env
	docker run -it --rm $(DEFAULT_ARGS) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt rum-all destroy $(tg_args)

apply: verify-pre-work apply-tg ## Apply the current terragrunt stage

apply-all: verify-pre-work plan-all-tg apply-all-tg ## Apply all the terragrunt stages in subdirectories

init: verify-pre-work init-scripts init-tg ## Initialize the current terragrunt stage

init-all: verify-pre-work init-all-tg ## Initialize all the terragrunt stages in subdirectories

plan: verify-pre-work plan-tg ## Plan the current terragrunt stage

plan-all: verify-pre-work plan-all-tg ## Plan all the terragrunt stages in subdirectories

destroy: destroy-tg ## Destroy the current terragrunt stage

destroy-all: destroy-all-tg ## Destroy all the terragrunt stages in subdirectories
