# Twilio Terraform Scripts

These are scripts for provisioning some of the Aselo Twilio infrastructure.

## Preparation

In order to set up terraform 

* In this directory run `terrafom init`
* Configure twilio creds in a `.env` file in `/scripts/` as you would for running the other scripts, and run the script below. Twilio creates a bunch of default resources on a neqw account and Aselo uses some of them. We need to import them into terraform first, otherwise terraform assumes they don't exist and will try to create them, resulting in errors
```
npm run importDefaultTwilioResourcesToTerraform
```
* Run `terraform validate` - this should give the all clear.
* You will need a tfvars specific to your new environment, create one using `private.tfvars.example` as a guide. Leave `serverless_url` as the placeholder in the example if it's a brand new environment, or get it from the serverless environment URL for an existing one (see 'Running on a new environment') below.

## Running on a new environment

There are currently some gotchas which mean that, unfortunately, it's not a simple as running `terraform apply` when provisioning an environment for the first time (but hopefully should be good after that).

The process for a first fun is as follows:

* Run and review the output of (assuming you called your tfvars file `private.tfvars`:
```terraform plan -var-file private.tfvars```
 Run (assuming you called your tfvars file `private.tfvars`):
```terraform apply -var-file private.tfvars```
* Go to the console for your environment, go into Functions > Services > serverless > environments and copy the domain for production (e.g. http://serverless-1234-production.twil.io) and set it as your `serverless_url` in your *.tfvars file.
* Rerun
```terraform apply -var-file private.tfvars```

Unfortunately, a feature gap in the twilio terraform provider means the domain URL cannot be extracted from the resource. The easiest workaround is to put it in a variable after it has been generated initially


## Importing a pre-existing environment

Not attempted this yet. If it's the same process as for the new environment, it could be difficult. A lot of the items could be imported alongside the existing ones, but not those that specify `unique_name`s. It's basically a choice between importing the existing resource (fiddly), creating new ones & then deleting old ones (not always possible) or deleting then creating (bit scary).

## Missing Bits

This terraform is currently incomplete, this is what isn't covered and needs creating with scripts or manually:

* Service Configuration - not currently managed by the twilio provider. We can use a provisioner but currently you need still need to call the REST service manually
* API Keys - Whilst API Keys can be created using the twilio terraform provider, it's a bit useless because it provides no way of accessing the secret to record somewhere, so a key created in terraform can never be accessed as far as I can tell.
* Okta - doesn't set up anything in Twilio or Okta for this right now.
* DataDog - it puts the keys you provide via tfvars in the AWS Parameter Store, but it won't provision the application in DataDog for you (but it could!).
* Deployments - Terraform isn't supposed to deploy, only provision, so this script will never deploy our plugin, serverless functions or webchat.

