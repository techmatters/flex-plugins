##@ Test and Lint

lint: fmt-check tflint tfsec ## Run all linting tools

fmt-check: ## Check if the terraform files are formatted correctly
	docker run -it --rm -v $(GIT_ROOT)/terraform:/app $(DOCKER_IMAGE):$(TF_VER) terraform fmt -recursive -write=false -diff $(tf_args)

fmt-fix: ## Fix the formatting of the terraform files
	docker run -it --rm -v $(GIT_ROOT)/terraform:/app $(DOCKER_IMAGE):$(TF_VER) terraform fmt -recursive $(tf_args)

hclfmt: ## Fix the format of all HCL files globally
	docker run -it --rm -v $(GIT_ROOT):$(MOUNT_PATH) -w $(TF_ROOT_PATH) $(TG_ENV) $(DOCKER_IMAGE):$(TF_VER) terragrunt hclfmt $(tg_args)

tflint: ## Run tflint on the terraform files
	docker run -it --rm -v $(GIT_ROOT)/terraform:/data -e TFLINT_LOG=warn ghcr.io/terraform-linters/tflint-bundle --recursive

tfsec: ## Run tfsec on the terraform files to check for security issues
	docker run -it --rm -v $(GIT_ROOT)/terraform:/src aquasec/tfsec /src

checkov: ## Run checkov on the terraform files to check for security issues
	docker run -it --rm -v $(GIT_ROOT)/terraform:/data bridgecrew/checkov -d /data

