tg_args ?= $(tf_args)     # --terragrunt-log-level debug --terragrunt-debug

TG_ENV = -e TERRAGRUNT_DOWNLOAD=".terragrunt-cache/$(HL)/$(HL_ENV)"

verify-env:

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

##@ Terragrunt Stage Targets - Usage: make [target] HL=[hl short code] HL_ENV=[hl environment]
apply: verify-pre-work apply-tg ## Apply the current terragrunt stage

init: verify-pre-work init-scripts init-tg ## Initialize the current terragrunt stage

plan: verify-pre-work plan-tg ## Plan the current terragrunt stage

destroy: destroy-tg ## Destroy the current terragrunt stage

##@ Terragrunt All Stage Targets - Usage: make [target] HL=[hl short code] HL_ENV=[hl environment]

apply-all: verify-pre-work plan-all-tg apply-all-tg ## Apply all the terragrunt stages in subdirectories

init-all: verify-pre-work init-all-tg ## Initialize all the terragrunt stages in subdirectories

plan-all: verify-pre-work plan-all-tg ## Plan all the terragrunt stages in subdirectories

destroy-all: destroy-all-tg ## Destroy all the terragrunt stages in subdirectories

##@ Terragrunt Utilities

clean: ## Clean all local terragrunt cache dirs
	find . -type d -name ".terragrunt-cache" -exec rm -rf {} +

