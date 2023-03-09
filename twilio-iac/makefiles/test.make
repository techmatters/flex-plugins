lint: fmt-check tflint tfsec

fmt-check:
	docker run -it --rm -v $(MY_PWD)/twilio-iac:/app $(DOCKER_IMAGE):$(TF_VER) terraform fmt -recursive -write=false -diff $(tf_args)

fmt-fix:
	docker run -it --rm -v $(MY_PWD)/twilio-iac:/app $(DOCKER_IMAGE):$(TF_VER) terraform fmt -recursive $(tf_args)

tflint:
	docker run -it --rm -v $(MY_PWD)/twilio-iac:/data -e TFLINT_LOG=warn ghcr.io/terraform-linters/tflint-bundle --recursive

tfsec:
	docker run -it --rm -v $(MY_PWD)/twilio-iac:/src aquasec/tfsec /src
