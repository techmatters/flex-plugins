# Twilio Terraform Scripts

These are scripts for provisioning some of the Aselo Twilio infrastructure.

## Running on a new environment

There are currently some gotchas which mean that, unfortunately, it's not a simple as running `terraform apply` when provisioning an environment for the first time (but hopefully should be good after that).

The process for a first fun is as follows:

* Configure twilio creds in a `.env` file in `/scripts/` as you would for running the other scripts, and run the script below. Twilio creates a bunch of default resources on a neqw account and Aselo uses some of them. We need to import them into terraform first, otherwise terraform assumes they don't exist and will try to create them, resulting in errors
```
npm run importDefaultTwilioResourcesToTerraform
```
* In this directory run `terrafom init`, then `terraform validate`
* You will need a tfvars specific to your new environment, create one using `private.tfvars.example` as a guide
* Run and review the output of (assuming you called your tfvars file `private.tfvars`:
```terraform plan -var-file private.tfvars```
 Run (assuming you called your tfvars file `private.tfvars`):
```terraform apply -var-file private.tfvars```

## Missing Bits

This terraform is currently incomplete, this is what isn't covered and needs creating with scripts or manually:

* Service Configuration - not currently managed by the twilio provider. We can use a provisioner but currently you need still need to call the REST service manually
* API Keys - Whilst API Keys can be created using the twilio terraform provider, it's a bit useless because it provides no way of accessing the secret to record somewhere, so a key created in terraform can never be accessed as far as I can tell.
* Deployments - Terraform isn't supposed to deploy, only provision, so this script will never deploy our plugin, serverless functions or webchat
* Okta - doesn't set up anything in Twilio or Okta for this right now.
* DataDog - it puts the keys you provide via tfvars in the AWS Parameter Store, but it won't provision the application in DataDog for you