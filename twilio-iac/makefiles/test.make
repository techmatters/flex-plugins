lint: fmt tflint tfsec

tflint:
	docker run -it --rm -v $(MY_PWD)/twilio-iac:/data -e TFLINT_LOG=warn ghcr.io/terraform-linters/tflint-bundle --recursive

tfsec:
	docker run -it --rm -v $(MY_PWD)/twilio-iac:/src aquasec/tfsec /src
