apply: apply-main

apply-main:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform apply $(tf_args)

get:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform get --update $(tf_args)

init: init-pre init-main

init-pre: manage-ssm-secrets

init-main:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform init $(tf_args)

plan:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform plan $(tf_args)

destroy:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform destroy $(tf_args)

validate:
	docker run -it --rm $(DEFAULT_ARGS) $(DOCKER_IMAGE):$(TF_VER) terraform validate $(tf_args)

lint:
	docker run -it --rm -v $(MY_PWD):/data -e TFLINT_LOG=warn --entrypoint '' -w /data/$(MY_ENV) wata727/tflint tflint --module .